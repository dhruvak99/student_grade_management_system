def evaluate_student(record):
    internals = [record.i1, record.i2, record.i3]
    quizzes = [record.q1, record.q2, record.q3]

    best_internals = sorted(internals, reverse=True)[:2]
    best_quizzes = sorted(quizzes, reverse=True)[:2]

    final_score = (sum(best_internals) + sum(best_quizzes)) / 2

    return {
        "student_id": record.student_id,
        "internals": internals,
        "quizzes": quizzes,
        "best_internals": best_internals,
        "best_quizzes": best_quizzes,
        "final_score": round(final_score, 2)
    }