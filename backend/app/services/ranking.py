from app.services.evaluation import evaluate_student

def get_rankings(records):
    evaluated = [evaluate_student(r) for r in records]
    evaluated.sort(key=lambda x: x["final_score"], reverse=True)
    return evaluated


def get_top_k(records, k: int):
    ranked = get_rankings(records)
    return ranked[:k]