import gspread
from google.oauth2.service_account import Credentials

# Scope required for Google Sheets
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]
# Path to credentials.json
CREDS_FILE = "app/credentials.json"


def get_sheet(sheet_name: str):
    creds = Credentials.from_service_account_file(
        CREDS_FILE, scopes=SCOPES
    )
    client = gspread.authorize(creds)

    # Open by sheet name
    sheet = client.open(sheet_name).sheet1
    return sheet


def upload_students_to_sheet(sheet_name: str, students: list):
    """
    students: list of dicts returned by evaluate_student()
    """
    sheet = get_sheet(sheet_name)

    # Clear old content
    sheet.clear()

    # Header
    headers = [
        "Student ID",
        "Internal 1",
        "Internal 2",
        "Internal 3",
        "Quiz 1",
        "Quiz 2",
        "Quiz 3",
        "Best Internals",
        "Best Quizzes",
        "Final Score",
    ]

    sheet.append_row(headers)

    for s in students:
        row = [
            s["student_id"],
            s["internals"][0],
            s["internals"][1],
            s["internals"][2],
            s["quizzes"][0],
            s["quizzes"][1],
            s["quizzes"][2],
            f"{s['best_internals'][0]}, {s['best_internals'][1]}",
            f"{s['best_quizzes'][0]}, {s['best_quizzes'][1]}",
            s["final_score"],
        ]
        sheet.append_row(row)

    return True