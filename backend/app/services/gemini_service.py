# backend/app/services/gemini_service.py
import os
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# --- Configuration (Keep as before, ensure MODEL_NAME is set) ---
GOOGLE_API_KEY = None
gemini_model = None
MODEL_NAME = "gemini-1.5-flash"
# ... (rest of config: safety_settings, generation_config, system_instruction) ...
# --- Initialization Block (Keep as before) ---
try:
    GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
    if not GOOGLE_API_KEY:
        print("***************************************************************")
        print("Gemini Service WARNING: GOOGLE_API_KEY environment variable not set.")
        # ... (rest of warning) ...
    else:
        genai.configure(api_key=GOOGLE_API_KEY)
        print(f"Gemini Service: Configured using API Key.")
        # ... (generation_config, safety_settings, system_instruction definitions) ...
        try:
            gemini_model = genai.GenerativeModel(
                 model_name=MODEL_NAME,
                 # ... (configs and instruction) ...
            )
            print(f"Gemini Service: Model '{gemini_model.model_name}' initialized.")
        except Exception as model_e:
             print(f"Gemini Service ERROR during model initialization: {model_e}")

except Exception as e:
    print(f"Gemini Service CRITICAL ERROR during initial configuration: {e}")

# --- format_history_for_gemini (Keep as before) ---
def format_history_for_gemini(db_messages):
    # ... (no changes needed) ...
    gemini_history = []
    for msg in db_messages:
        role = 'model' if msg.sender == 'ai' else 'user'
        if role not in ['user', 'model']: continue
        gemini_history.append({'role': role, 'parts': [{'text': msg.content}]})
    return gemini_history


# --- get_gemini_response_stream (Keep as before) ---
def get_gemini_response_stream(formatted_history, new_prompt):
    # ... (no changes needed to the streaming logic itself) ...
    if not gemini_model: # Check if model is available
         print("Gemini Service ERROR: get_gemini_response_stream called but model not initialized.")
         yield "[SYSTEM: AI model is currently unavailable.]"
         return
    print(f"Gemini Service: Preparing request - History len: {len(formatted_history)}, Prompt: '{new_prompt[:50]}...'")
    try:
        full_conversation = formatted_history + [{'role': 'user', 'parts': [{'text': new_prompt}]}]
        response_stream = gemini_model.generate_content(full_conversation, stream=True)
        print(f"Gemini Service: Streaming response from model '{MODEL_NAME}'...")
        any_text_yielded = False
        for chunk in response_stream:
            # ... (stream processing logic, checking for text, safety, stop reasons - keep as before) ...
             chunk_text = None
             try: chunk_text = chunk.text
             except ValueError: print(f"Gemini Service: Non-text chunk - {chunk.prompt_feedback}, {chunk.candidates}")
             except Exception as e_text: print(f"Gemini Service ERROR accessing chunk.text: {e_text}")

             if chunk_text:
                  any_text_yielded = True
                  yield chunk_text
             else: # Check safety/finish reason if no text
                 if chunk.prompt_feedback and chunk.prompt_feedback.block_reason: # Handle blocks
                     reason = chunk.prompt_feedback.block_reason or "Safety Filter"
                     print(f"Gemini Service WARNING: Blocked - Reason: {reason}")
                     yield f"[SYSTEM: Request blocked ({reason}). Rephrase query.]"
                     return
                 if chunk.candidates and chunk.candidates[0].finish_reason != 'STOP' and chunk.candidates[0].finish_reason is not None: # Handle non-stop finishes
                      finish_reason = chunk.candidates[0].finish_reason or "Unknown"
                      print(f"Gemini Service WARNING: Generation stopped abnormally - Reason: {finish_reason}")

        if any_text_yielded: print("Gemini Service: Stream processing finished normally.")
        else: print("Gemini Service WARNING: Stream finished, but no text content was yielded.")

    except Exception as e: # Catch general exceptions during API call
        print(f"Gemini Service CRITICAL ERROR during API call: {type(e).__name__} - {e}")
        yield "[SYSTEM: Unexpected error contacting AI service.]"


# --- NEW FUNCTION: Generate Chat Title ---
def generate_chat_title(first_user_msg, first_ai_msg):
    """Generates a concise title for a chat session using Gemini."""
    if not gemini_model:
        print("Gemini Service ERROR: Cannot generate title, model not initialized.")
        return None # Return None if model isn't available

    # Keep the title prompt concise and clear
    prompt = f"""Create a very short, concise title (max 5 words) for the following conversation start:
User: {first_user_msg[:200]}  # Limit input length
Assistant: {first_ai_msg[:300]} # Limit input length
Title:""" # The "Title:" acts as a prompt for the desired output format

    print(f"Gemini Service: Generating title based on:\nUser: {first_user_msg[:50]}...\nAI: {first_ai_msg[:50]}...")

    try:
        # Use generate_content without streaming for a simple request/response
        response = gemini_model.generate_content(
            prompt,
            # Use stricter temp for deterministic title, adjust if needed
            generation_config=genai.types.GenerationConfig(temperature=0.2)
        )

        # Access generated text safely
        generated_title = response.text.strip().replace('"', '') # Remove quotes if AI adds them
        if generated_title:
             print(f"Gemini Service: Generated Title - '{generated_title}'")
             return generated_title[:100] # Limit title length just in case
        else:
            print("Gemini Service WARNING: Title generation returned empty response.")
            # Check for blocking or finish reasons if empty
            if response.prompt_feedback and response.prompt_feedback.block_reason:
                print(f"Title gen blocked: {response.prompt_feedback.block_reason}")
            if response.candidates and response.candidates[0].finish_reason != 'STOP':
                print(f"Title gen finished abnormally: {response.candidates[0].finish_reason}")
            return None

    except Exception as e:
        print(f"Gemini Service ERROR generating chat title: {e}")
        return None # Return None on error

# --- END NEW FUNCTION ---