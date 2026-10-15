require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../../models/Product");

// variant keys that are not attribute selections
const VARIANT_META_KEYS = [
  "_id",
  "price",
  "originalPrice",
  "quantity",
  "discount",
  "productId",
  "barcode",
  "sku",
  "image",
  "profit",
];

// match a stored product variant against the variant saved in the cart item
const isSameVariant = (productVariant, cartVariant) => {
  if (productVariant.productId && cartVariant.productId) {
    return String(productVariant.productId) === String(cartVariant.productId);
  }
  const attrKeys = Object.keys(cartVariant).filter(
    (k) => !VARIANT_META_KEYS.includes(k)
  );
  return (
    attrKeys.length > 0 &&
    attrKeys.every((k) => String(productVariant[k]) === String(cartVariant[k]))
  );
};

// decrease product quantity after an order created
// works for store orders (productId set at checkout) and POS orders (_id is the product id)
const handleProductQuantity = async (cart) => {
  for (const p of cart || []) {
    try {
      const productId = [p?.productId, p?._id, p?.id].find((id) =>
        mongoose.isValidObjectId(id)
      );
      const qty = Number(p?.quantity) || 0;
      if (!productId || qty <= 0) continue;

      const product = await Product.findById(productId).select("variants");
      if (!product) continue;

      const inc = { stock: -qty, sales: qty };

      if (p.variant && product.variants?.length > 0) {
        const index = product.variants.findIndex((v) =>
          isSameVariant(v || {}, p.variant)
        );
        if (index >= 0) inc[`variants.${index}.quantity`] = -qty;
      }

      await Product.updateOne({ _id: product._id }, { $inc: inc });
    } catch (err) {
      console.log("err on handleProductQuantity", err.message);
    }
  }
};

const handleProductAttribute = async (key, value, multi) => {
  try {
    const products = await Product.find({ isCombination: true });

    for (const p of products) {
      await Product.updateOne(
        { _id: p._id },
        {
          $pull: {
            variants: multi
              ? { [key]: { $in: value } }
              : { [key]: value },
          },
        }
      );
    }
  } catch (err) {
    console.log("err, when delete product variants", err.message);
  }
};

module.exports = {
  handleProductQuantity,
  handleProductAttribute,
};
