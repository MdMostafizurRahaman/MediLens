import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

print(" Checking available models for fine-tuning...\n")

try:
    # List all available models
    print(" All Available Models:")
    for model in genai.list_models():
        print(f"  - {model.name}")
        if hasattr(model, 'supported_generation_methods'):
            print(f"    Methods: {model.supported_generation_methods}")
        print()
    
    print("\n" + "="*60)
    print(" Models that support tuning:")
    
    # Check which models support tuning
    tunable_models = []
    for model in genai.list_models():
        if hasattr(model, 'supported_generation_methods'):
            if 'createTunedModel' in model.supported_generation_methods:
                tunable_models.append(model.name)
                print(f"   {model.name}")
    
    if not tunable_models:
        print("  No tunable models found")
    
    print(f"\nFound {len(tunable_models)} tunable models")
    
    if tunable_models:
        print(f"\nRecommended base model: {tunable_models[0]}")
        print(f"Update .env file with: BASE_MODEL={tunable_models[0]}")

except Exception as e:
    print(f"Error checking models: {e}")

print("\nModel check completed!")
