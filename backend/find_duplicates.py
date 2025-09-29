import pandas as pd
import sys
import json
import os

def error_response(message, details=None, available_columns=None):
    response = {"error": message}
    if details:
        response["details"] = details
    if available_columns is not None:
        response["available_columns"] = available_columns
    print(json.dumps(response))
    sys.exit(1)

# Get CSV path and columns
if len(sys.argv) < 2:
    error_response("No CSV file path provided")

csv_path = sys.argv[1]
columns_arg = sys.argv[2] if len(sys.argv) > 2 else ""
columns_to_check = [c.strip() for c in columns_arg.split(',') if c.strip()]

if not os.path.isfile(csv_path):
    error_response("CSV file not found", details=f"Path: {csv_path}")

try:
    df = pd.read_csv(csv_path)
except Exception as e:
    error_response("Could not read CSV file", details=str(e))

if df.empty:
    error_response("CSV file is empty")

if not columns_to_check:
    error_response(
        "No columns specified for duplicate check",
        available_columns=df.columns.tolist()
    )

missing_cols = [col for col in columns_to_check if col not in df.columns]
if missing_cols:
    error_response(
        f"Columns not found: {missing_cols}",
        available_columns=df.columns.tolist()
    )

duplicates = df[df.duplicated(subset=columns_to_check, keep=False)]

print(json.dumps({"duplicates": json.loads(duplicates.to_json(orient='records'))}))
