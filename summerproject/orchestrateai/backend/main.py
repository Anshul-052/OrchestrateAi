from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import workflows, runs, webhooks

app = FastAPI(title="OrchestrateAi API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workflows.router)
app.include_router(runs.router)
app.include_router(webhooks.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
