import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import ProductsModel from "./model.js";
import ReviewsModel from "../reviews/model.js";
import ProductsCategoriesModel from "./productsCategoriesModel.js";
import CategoriesModel from "../categories/model.js";

const productsRouter = express.Router();

productsRouter.post("/", async (req, res, next) => {
  try {
    const { id } = await ProductsModel.create(req.body);
    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    const name = req.query.name;
    const priceMin = req.query.priceMin;
    const priceMax = req.query.priceMax;
    const category = req.query.category;
    if (name) query.name = { [Op.iLike]: `${name}%` };
    if (priceMin && priceMax)
      query.price = {
        [Op.and]: { [Op.gte]: `${priceMin}`, [Op.lte]: `${priceMax}` },
      };
    if (category) query.category = { [Op.like]: `${category}` };
    const products = await ProductsModel.findAll({
      where: { ...query },
      attributes: ["id", "name", "description", "price"],
      include: [
        {
          model: ReviewsModel,
        },
        { model: CategoriesModel },
      ],
    }); // (SELECT) pass an array for the include list
    res.send(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findByPk(req.params.productId, {
      attributes: { exclude: ["createdAt", "updatedAt"] }, // (SELECT) pass an object with exclude property for the omit list
      include: [
        {
          model: ReviewsModel
        },{
           model: CategoriesModel
          }
      ]
    });
    if (product) {
      res.send(product);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows, updatedRecords] = await ProductsModel.update(
      req.body,
      {
        where: { id: req.params.productId },
        returning: true,
      }
    );
    if (numberOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ProductsModel.destroy({
      where: { id: req.params.productId },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const product = await ProductsModel.findByPk(req.params.productId, {
      include: {
        model: ReviewsModel,
        attributes: ["rating", "title", "content"],
      },
    });
    res.send(product);
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId/editCategory", async (req, res, next) => {
  try {
    const { id } = await ProductsCategoriesModel.create({
      productId: req.params.productId,
      categoryId: req.body.categoryId,
    });
    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

export default productsRouter;