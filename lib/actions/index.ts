"use server"
import { revalidatePath } from "next/cache";
import Product from "../models/productmodel";
import { scrapedAmazonProduct } from "../scraper";
import { connectToDB } from "../scraper/mongose";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";





export async function scrapeAndStoreProduct(productUrl: string) {
    if(!productUrl) return;

    try {
        connectToDB();
        const scrapedProduct = await scrapedAmazonProduct(productUrl);
        if(!scrapedProduct) return;

        let product = scrapedProduct;

        const existingProduct = await Product.findOne({ url: scrapedProduct.url });
        if(existingProduct) {
            const updatedPriceHistory: any = [
              ...existingProduct.priceHistory,
              { price: scrapedProduct.currentPrice }
            ]
      
            product = {
              ...scrapedProduct,
              priceHistory: updatedPriceHistory,
              lowestPrice: getLowestPrice(updatedPriceHistory),
              highestPrice: getHighestPrice(updatedPriceHistory),
              averagePrice: getAveragePrice(updatedPriceHistory),
            }
          }
          const newProduct = await Product.findOneAndUpdate(
            { url: scrapedProduct.url },
            product,
            { upsert: true, new: true }
          );
          revalidatePath(`/products/${newProduct._id}`);



    } catch (error: any) {
console.log(error)    }

}


export async function getProductById(productId: string) {
    try {
      connectToDB();
  
      const product = await Product.findOne({ _id: productId });
  
      if(!product) return null;
  
      return product;
    } catch (error) {
      console.log(error);
    }
  }


  export async function getAllProducts() {
    try {
      connectToDB();
  
      const products = await Product.find();
  
      return products;
    } catch (error) {
      console.log(error);
    }
  }