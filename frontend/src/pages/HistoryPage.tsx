import { useEffect, useState } from 'react';
import type { ReviewRecord } from '../types/domain';

const API_BASE = 'http://localhost:8000/api';

export function HistoryPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/history`)
      .then((response) => response.json())
      .then((data) => setReviews(data.reviews ?? []));
  }, []);

  return (
    <section className="page">
      <h1>History</h1>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>AI Code</th><th>Defect</th><th>Compare</th><th>Status</th><th>Decision</th><th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id ?? `${review.aiCode}-${review.updatedAt}`}>
                <td>{review.aiCode}</td>
                <td>{review.defectName}</td>
                <td>{review.autoCompareResult}</td>
                <td>{review.status}</td>
                <td>{review.reviewerDecision}</td>
                <td>{review.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
