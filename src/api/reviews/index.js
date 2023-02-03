import express from "express";
import ReviewsModel from "./model.js";

const reviewsRouter = express.Router();

//this is for adding a new review in reviews table
reviewsRouter.post("/", async (req, res, next) => {
  try {
    const { id } = await ReviewsModel.create(req.body);
    res.status(201).send({ reviewId: id });
  } catch (error) {
    next(error);
  }
});

//this is for fetching all the reviews
reviewsRouter.get("/", async (req, res, next) => {
  try {
    const reviews = await ReviewsModel.findAll();
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

//get single review by id
reviewsRouter.get("/:reviewId", async (req, res, next) => {
  try {
    const review = await ReviewsModel.findByPk(req.params.reviewId, {
      attributes: { exclude: ["createdAt", "updatedAt"] }, // (SELECT) pass an object with exclude property for the omit list
    });
    if (review) {
      res.send(review);
    } else {
      next(
        createHttpError(404, `Review with id ${req.params.reviewId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

//edit single review
reviewsRouter.put("/:reviewId", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows, updatedRecords] = await ReviewsModel.update(
      req.body,
      {
        where: { id: req.params.reviewId },
        returning: true,
      }
    );
    if (numberOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(
        createHttpError(404, `Review with id ${req.params.reviewId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

//delete single review
reviewsRouter.delete("/:reviewId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ReviewsModel.destroy({
      where: { id: req.params.reviewId },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Review with id ${req.params.reviewId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default reviewsRouter;