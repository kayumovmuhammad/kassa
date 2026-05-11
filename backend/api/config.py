from load_dotenv import load_dotenv
import os

class Config():
    def __init__(self):
        load_dotenv()
        self.PAGE_COUNT = int(os.getenv("PAGE_COUNT", "0"))
        self.ALL_CATEGORY_ID = int(os.getenv("ALL_CATEGORY_ID", "0"))
