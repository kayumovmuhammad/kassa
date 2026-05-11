from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import category_router, item_router, sell_router, stats_router
from database.db import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    category_router.init_all_category()

    print("[LOG] => INIT")
    yield
    print("[LOG] => END")


app = FastAPI(title="CRM System", lifespan=lifespan)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(item_router.router, tags=["Item"])
app.include_router(sell_router.router, tags=["Sell"])
app.include_router(category_router.router, tags=["Category"])
app.include_router(stats_router.router, tags=["Stats"])


@app.get("/")
async def root():
    return {"message": "Welcome to CRM System by Q.Muhammad"}
