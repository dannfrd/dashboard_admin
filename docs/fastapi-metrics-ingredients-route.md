# FastAPI route example for `/metrics/ingredients`

This example matches the dashboard requirement:

- `GET /metrics/ingredients`
- protected by `require_monitoring_access`
- returns rows from the `ingredients` table

```python
from typing import Annotated

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Ingredient
from app.auth import require_monitoring_access

app = FastAPI()


@app.get("/metrics/ingredients")
def get_metrics_ingredients(
    _auth: Annotated[None, Depends(require_monitoring_access)],
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Ingredient)
        .order_by(Ingredient.id.desc())
        .all()
    )

    return [
        {
            "id": row.id,
            "name": row.name,
            "description": row.description,
            "function": row.function,
            "risk_level": row.risk_level,
            "created_at": row.created_at,
        }
        for row in rows
    ]
```

If you prefer SQLAlchemy Core or raw SQL, the equivalent query is:

```sql
SELECT id, name, description, function, risk_level, created_at
FROM ingredients
ORDER BY id DESC;
```

Expected JSON shape for the dashboard:

```json
[
  {
    "id": 1,
    "name": "SALICYLIC ACID",
    "description": "Beta hydroxy acid used for exfoliation.",
    "function": "Exfoliant",
    "risk_level": "medium",
    "created_at": "2026-07-03T10:15:00"
  }
]
```

Notes:

- The dashboard sends `Authorization: Bearer <token-admin>` when an admin token exists.
- If your backend accepts API keys for monitoring access, the request may also use `x-api-key: <MONITORING_API_KEY>`.
- Keep the route under the same auth policy as `require_monitoring_access` so the table stays protected.
