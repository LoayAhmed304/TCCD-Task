# E-Commerce Platform Backend APIs

## Documentation and Endpoints Details
Visit [this link](https://documenter.getpostman.com/view/37899717/2sB3BEnAFp#ee5b01fa-59ee-44ac-8cc5-10537f9a0be8)
## How to Run
The application is Dockerized, you should be able to run it as any dockerized app.

1. **Make sure Docker is installed and running**
2. **Have a .env file for the variables defined in the `docker-compose.yml` file**

```sh
docker compose up --build -d
```

## Assumptions
Please check the API documentation, it has an overview about what I assumed for each route. If there are any unclear assumption, you can come here and check for more details. This is to save some time.

**Cart Deletion**: I've assumed that every user can only have 1 cart and 1 cart only, that resulted in some conflicts in other endpoints.
- The required DELETE request didn't specify a cart ID or anything that identifies which cart a user should delete, also it's totally not preferrable to add a body in a DELETE request, hence I assumed that you meant a user should only have 1 cart, that's why the DELETE request contains no information about which cart to be deleted.

**Cart's Items Retrieval**: I've added another route to retrieve a user's ONLY cart's items as assumed before, instead of getting a cart by ID and running checks to invalidate requests for carts that don't belong to a user. 
- The required GET request specified a cart ID in the query parameter, and according to my assumption, it looked like a conflict with what I asssumed according to your definitions.
- However I didn't remove the required route for getting a cart by ID, I've just restricted it to admins only. Some details are provided in the API documentation.

**Cart Item Updating**: I restricted the updating to only updating the quantity.
- Because updating a cart item should not include changing the product itself, in that case the user should create a new cart item instead and remove the old one. (However an item deletion isn't required) and I haven't implemented it for simplicity reasons.
- Following the security purposes, this route shouldn't be handled even by admins, because changing a user's cart item quantity isn't really a thing that should happen.
- That's why this route checks and makes sure that the provided item id really belongs to the currently logged in user.

**Cart Item Retrieval by ID**: I restricted this route to admins only.
- Since a user won't typically request for a specific cart item that he owns and by cart item ID, the user already can see all his cart items in the /cart route, which returns all his cart's items and in details.
- That's why I've decided this should be restricted to admins only, even though it might not be really useful in real-world scenarios.

**Cart Item Creation**: I made this available to authetnticated users normall, however the one making the request must be the one owning the cart provided its id.
