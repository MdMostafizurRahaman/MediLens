# Customized Chatbot (Gemini Fine-tuning)

This folder contains the dataset preparation artifacts and notebook used to fine-tune a Gemini model for a medical chatbot.

## Contents
- `ai-medical-chatbot.csv`: original dataset
- `ai-medical_chatbot.json`: cleaned JSON format used for fine-tuning
- `Fine-tune.ipynb`: notebook that runs the fine-tuning workflow

## Data Notes
- Inputs are based on patient messages (description removed as requested).
- Greetings such as "Hi/Hello" and "Hi/Hello doctor" were removed from inputs/outputs.
- `text_input` and `text_output` keys match the Gemini fine-tuning API format.

## Usage
Open `Fine-tune.ipynb` and run the cells after setting `GEMINI_API_KEY` in the environment.
