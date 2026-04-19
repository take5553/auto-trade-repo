from fastapi import FastAPI
from routers import card_list, nikkei_core_50

app = FastAPI()

app.include_router(card_list.router)
app.include_router(nikkei_core_50.router)


@app.get("/api/hello")
def read_root():
    return {"message": "Hello from Python!"}


@app.get("/api/good_night")
def good_night():
    return {"message": "Good night from Python!"}
