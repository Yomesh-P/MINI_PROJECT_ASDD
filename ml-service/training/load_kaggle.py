"""
Kaggle T20 Dataset Ingestion & Preprocessing Script (LO5 Data Engineering)

Processes Kaggle ball-by-ball matches (e.g. IPL or international T20 data)
into aggregated PlayerMatchStat records matching our MongoDB schema.
"""
import os
import pandas as pd
import numpy as np

def process_kaggle_csv(matches_csv_path: str, deliveries_csv_path: str, output_path: str):
    """
    Ingests raw Kaggle matches and deliveries CSV files, aggregates per-match
    batting and bowling features, and generates clean training datasets.
    """
    if not (os.path.exists(matches_csv_path) and os.path.exists(deliveries_csv_path)):
        print(f"[Kaggle Loader] Input CSVs not found at {matches_csv_path}. Skipping raw ingest.")
        return None

    print("[Kaggle Loader] Reading raw CSVs...")
    df_matches = pd.read_csv(matches_csv_path)
    df_deliv = pd.read_csv(deliveries_csv_path)

    # 1. Batting Aggregation per match per batsman
    batting_stats = df_deliv.groupby(["match_id", "batsman"]).agg(
        runs=("batsman_runs", "sum"),
        ballsFaced=("ball", "count"),
        fours=("batsman_runs", lambda x: (x == 4).sum()),
        sixes=("batsman_runs", lambda x: (x == 6).sum()),
    ).reset_index()
    batting_stats["strikeRate"] = (batting_stats["runs"] / batting_stats["ballsFaced"]) * 100

    # 2. Bowling Aggregation per match per bowler
    bowling_stats = df_deliv.groupby(["match_id", "bowler"]).agg(
        ballsBowled=("ball", "count"),
        runsConceded=("total_runs", "sum"),
        wickets=("is_wicket", "sum"),
    ).reset_index()
    bowling_stats["overs"] = np.round(bowling_stats["ballsBowled"] / 6, 1)
    bowling_stats["economyRate"] = (bowling_stats["runsConceded"] / (bowling_stats["ballsBowled"] / 6))

    # 3. Merge with match level metadata
    merged = pd.merge(batting_stats, df_matches[["id", "date", "venue", "winner", "player_of_match"]],
                      left_on="match_id", right_on="id")
    merged["isPlayerOfMatch"] = (merged["batsman"] == merged["player_of_match"]).astype(int)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    merged.to_csv(output_path, index=False)
    print(f"[Kaggle Loader] Processed {len(merged)} records into {output_path}")
    return merged

if __name__ == "__main__":
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    process_kaggle_csv(
        os.path.join(data_dir, "matches.csv"),
        os.path.join(data_dir, "deliveries.csv"),
        os.path.join(data_dir, "kaggle_processed_stats.csv"),
    )
