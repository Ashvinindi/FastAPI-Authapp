from fastapi import FastAPI, status
from fastapi.exceptions import HTTPException
from pydantic import BaseModel

books = [
    {
        "id": 1,
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald"
    },
    {
        "id": 2,
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee"
    },
    {
        "id": 3,
        "title": "1984",
        "author": "George Orwell"
    },
    {
        "id": 4,
        "title": "Pride and Prejudice",
        "author": "Jane Austen"
    }

]
sample = FastAPI()

@sample.get("/book")
def get_book():
    return books

@sample.get("/book/{book_id}")
def get_book_by_id(book_id: int):
    for book in books:
        if book["id"] == book_id:
            return book
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

class Book(BaseModel):
    id: int
    title: str
    author:str


@sample.post("/morebooks")
def create_book(book: Book):
    new_book = book.model_dump() # Pydantic Model එක Dictionary එකක් කරයි
    books.append(new_book) # List එකට එකතු කරයි (Save)
    return new_book # Return the newly created book


class UpdateBook(BaseModel):
    title: str
    author:str

@sample.put("/book/{book_id}")
def update_book(book_id: int, updated_book: UpdateBook): 
    for book in books:
        if book["id"] == book_id:
            book["title"] = updated_book.title
            book["author"] = updated_book.author
            return book
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

@sample.delete("/book/{book_id}")
def delete_book(book_id: int):
    for book in books:
        if book["id"] == book_id:
            return books.remove(book)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")