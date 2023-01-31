# crypto-table

Welcome to crypto-table codebase. It's a web app that allows you to find biggest difference of identical trading pairs on different crypto exchanges(only theoretically,
does not work in practice, on all coins or the withdrawal/deposit is blocked, or no volume in order books, or is different chains, so it's a simple pet-project)

## 🛠 Tech stack

Stack: Django, DRF, JWT, Postgresql, React

## 🔮 Installing and running locally

1. Install [Docker](https://www.docker.com/get-started)

2. Clone the repo

    ```sh
    $ git clone https://github.com/panasicov/crypto-table
    $ cd crypto-table
    ```
3. Create `.env` files in frontend and backend paths with variables as in `.env-example`

4. Run

    ```sh
    $ docker compose up
    ```

This will start the frontend on [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
and backend on [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
