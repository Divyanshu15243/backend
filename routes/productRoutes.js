const express = require("express");
const router = express.Router();
const {
  addProduct,
  addAllProducts,
  getAllProducts,
  getShowingProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  updateManyProducts,
  updateStatus,
  deleteProduct,
  deleteManyProducts,
  getShowingStoreProducts,
} = require("../controller/productController");

//add a product
router.post("/add", addProduct);

//add multiple products
router.post("/all", addAllProducts);

//get showing products only
router.get("/show", getShowingProducts);

//get showing products in store
router.get("/store", getShowingStoreProducts);

//get a product by slug
router.get("/product/:slug", getProductBySlug);

//get all products
router.get("/", getAllProducts);

//update many products
router.patch("/update/many", updateManyProducts);

//delete many product
router.patch("/delete/many", deleteManyProducts);

//get a product
router.post("/:id", getProductById);

//update a product
router.patch("/:id", updateProduct);

//update a product status
router.put("/status/:id", updateStatus);

//delete a product
router.delete("/:id", deleteProduct);

module.exports = router;
