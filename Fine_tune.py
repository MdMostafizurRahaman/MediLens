import google.generativeai as genai
import pandas as pd
import time
from pathlib import Path
import logging
import json
import sys
import traceback
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure API with environment variable
API_KEY = os.getenv('GEMINI_API_KEY')
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=API_KEY)

def validate_and_truncate_example(example, max_length=5000):
    """Validate and truncate training example to meet API requirements."""
    truncated = example.copy()
    if len(truncated['text_output']) > max_length:
        truncated['text_output'] = truncated['text_output'][:max_length-3] + "..."
    return truncated

def prepare_training_data(data_path: str, max_examples_per_epoch=12500) -> tuple:
    """
    Prepare medical terminology data for fine-tuning with size limits.
    Returns tuple of (training_data, recommended_epochs)
    """
    if not Path(data_path).exists():
        raise FileNotFoundError(f"Training data not found at {data_path}")
    
    df = pd.read_csv(data_path)
    required_columns = ['Term', 'Explanation', 'Category']
    if not all(col in df.columns for col in required_columns):
        raise ValueError(f"Training data must contain columns: {required_columns}")
    
    training_examples = []
    for _, row in df.iterrows():
        examples = [
            {
                "text_input": f"Define the medical term: {row['Term']}",
                "text_output": f"{row['Explanation']} (Category: {row['Category']})"
            },
            {
                "text_input": f"What category is the medical term '{row['Term']}' in?",
                "text_output": row['Category']
            },
            {
                "text_input": f"What medical term matches this description: {row['Explanation']}",
                "text_output": row['Term']
            }
        ]
        
        # Validate and truncate each example
        training_examples.extend([
            validate_and_truncate_example(ex) for ex in examples
        ])
    
    # Calculate recommended epochs to stay under 250,000 total examples
    total_examples = len(training_examples)
    recommended_epochs = min(20, 250000 // total_examples)
    
    # If we have too many examples even for 1 epoch, subsample
    if total_examples > max_examples_per_epoch:
        logging.warning(f"Subsampling training data from {total_examples} to {max_examples_per_epoch} examples")
        training_examples = pd.DataFrame(training_examples).sample(n=max_examples_per_epoch).to_dict('records')
    
    # Save processed data
    output_path = Path(data_path).parent / "training_data.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(training_examples, f, indent=2)
    
    logging.info(f"Created training data with {len(training_examples)} examples")
    logging.info(f"Recommended epochs: {recommended_epochs}")
    logging.info(f"Sample training example: {training_examples[0]}")
    
    return training_examples, recommended_epochs

def fine_tune_model(
    training_data_path: str,
    base_model: str = "models/gemini-1.5-flash-001-tuning",
    model_name: str = "medical-terms-model",
    batch_size: int = 4,
    learning_rate: float = 0.001,
    wait_interval: int = 10
) -> tuple:
    """Fine-tune a Gemini model for medical terminology with automatic epoch calculation"""
    try:
        # Prepare and validate training data
        training_data, recommended_epochs = prepare_training_data(training_data_path)
        
        logging.info(f"Starting fine-tuning process for medical terminology model")
        logging.info(f"Using base model: {base_model}")
        logging.info(f"Using {recommended_epochs} epochs based on data size")
        
        # Create fine-tuning operation
        operation = genai.create_tuned_model(
            display_name=model_name,
            source_model=base_model,
            epoch_count=recommended_epochs,
            batch_size=batch_size,
            learning_rate=learning_rate,
            training_data=training_data,
            input_key="text_input",
            output_key="text_output"
        )
        
        # Monitor training progress
        logging.info("Training started...")
        snapshots = []
        for status in operation.wait_bar():
            logging.info(f"Training status: {status}")
            snapshots.append(status)
            time.sleep(wait_interval)
        
        result = operation.result()
        model = genai.GenerativeModel(model_name=result.name)
        
        # Save training metrics
        metrics = pd.DataFrame(result.tuning_task.snapshots)
        metrics.to_csv('training_metrics.csv', index=False)
        
        logging.info(f"Training completed successfully. Model name: {result.name}")
        return model, metrics
        
    except Exception as e:
        logging.error(f"Error during fine-tuning: {str(e)}")
        logging.error(f"Stack trace: {traceback.format_exc()}")
        raise

def test_model(model, test_terms: list):
    """Test the fine-tuned model with some example queries"""
    for term in test_terms:
        try:
            # Test definition query
            response = model.generate_content(f"Define the medical term: {term}")
            print(f"\nTerm: {term}")
            print(f"Definition: {response.text}")
            
            # Test category query
            response = model.generate_content(f"What category is the medical term '{term}' in?")
            print(f"Category: {response.text}")
            
        except Exception as e:
            logging.error(f"Error testing term {term}: {str(e)}")
            logging.error(f"Stack trace: {traceback.format_exc()}")

if __name__ == "__main__":
    # Setup logging with more detailed format
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(module)s - %(message)s'
    )
    
    # Configuration from environment variables
    TRAINING_DATA = os.getenv('TRAINING_DATA_PATH', './training_data.json')
    BASE_MODEL = os.getenv('BASE_MODEL', 'models/gemini-1.5-flash-001-tuning')
    MODEL_NAME = os.getenv('MODEL_NAME', 'medical-terminology-assistant')
    BATCH_SIZE = int(os.getenv('BATCH_SIZE', '4'))
    
    try:
        # Fine-tune model
        model, metrics = fine_tune_model(
            training_data_path=TRAINING_DATA,
            base_model=BASE_MODEL,
            model_name=MODEL_NAME,
            batch_size=BATCH_SIZE
        )
        
        # Test the model with some example terms
        test_terms = ["ADHD", "ACE", "ABO system"]
        test_model(model, test_terms)
        
    except Exception as e:
        logging.error(f"Training failed: {str(e)}")
        logging.error(f"Stack trace: {traceback.format_exc()}")
        sys.exit(1)