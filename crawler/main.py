from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from crawler import crawl_url



app = FastAPI(title="Weave Evidence Crawler")


class CrawlRequest(BaseModel):
    url: str


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "weave-crawler"
    }


@app.post("/crawl")
def crawl(request: CrawlRequest):
    try:
        result = crawl_url(request.url)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )