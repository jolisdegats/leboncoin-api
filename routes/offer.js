const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const cloudinary = require("cloudinary");

const Offer = require("../models/Offer.js");
const User = require("../models/User.js");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    //Si paramètres bien entrés
    if (
      req.fields.title &&
      req.fields.description &&
      req.fields.price &&
      req.files.picture !== undefined
    ) {
      //Si longueur des textes et prix ok
      if (req.fields.title.length > 50) {
        res.status(400).json("Title is too long (50 characters max)");
      } else {
        //
        if (req.fields.description.length > 500) {
          res.status(400).json("Description is too long (500 characters max)");
        } else {
          //
          if (req.fields.price > 100000) {
            res.status(400).json("Price is too high (100000 max)");
          } else {
            //  Retrouver l'ID de l'utilisateur (récupéré avec isAthenticated)
            const userData = await User.findOne({
              _id: req.fields.userRefId,
            });

            //Upload de l'image et récupération de l'URL
            const picture = await cloudinary.v2.uploader.upload(
              req.files.picture.path
            );

            // Création du document Offer
            const offer = await new Offer({
              created: Date(),
              title: req.fields.title,
              description: req.fields.description,
              price: req.fields.price,
              picture: {
                secure_url: picture.secure_url,
                public_id: picture.public_id,
              },
              creator: userData,
            });
            await offer.save();

            console.log(offer);

            // Retour d'une partie des éléments sauvegardés
            res.status(200).json({
              _id: offer.id,
              created: offer.created,
              title: offer.title,
              description: offer.description,
              price: offer.price,
              picture: {
                secure_url: offer.picture.secure_url,
                public_id: offer.picture.id,
              },
              creator: {
                account: offer.creator.account,
                _id: offer.creator.id,
              },
            });
          }
          //
        }
        //
      }
      //
    } else {
      res.status(400).json("Missing parameter");
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

router.get("/offer/with-count", async (req, res) => {
  try {
    // FIND
    let resultFilter = {};
    if (req.query.title) {
      resultFilter.title = new RegExp(req.query.title, "i");
    }

    priceFilter = {};
    if (req.query.priceMin || req.query.priceMax) {
      if (req.query.priceMin) {
        priceFilter.$gte = req.query.priceMin;
      }
      if (req.query.priceMax) {
        priceFilter.$lte = req.query.priceMax;
      }
      resultFilter.price = priceFilter;
    }

    // SORT
    let resultSort = {};
    if (req.query.sort === "price-desc") {
      resultSort.price = "desc";
    } else if (req.query.sort === "price-asc") {
      resultSort.price = "asc";
    } else if (req.query.sort === "date-desc") {
      resultSort.created = "desc";
    } else if (req.query.sort === "date-asc") {
      resultSort.created = "asc";
    } else {
      resultSort = null;
    }

    // PAGE COUNT + RESULTS PER PAGE
    if (req.query.limit) {
      resultsPerPage = Number(req.query.limit);
    } else {
      resultsPerPage = 10;
    }

    if (!req.query.page) {
      req.query.page = 1;
    }

    // RESULTS
    const completeList = await Offer.find(resultFilter);

    const list = await Offer.find(resultFilter)
      .sort(resultSort)
      .limit(resultsPerPage)
      .skip((req.query.page - 1) * resultsPerPage)
      .populate({
        path: "creator",
        select: "account.username account.phone",
      })
      .select("title price created creator picture description");

    res.status(200).json({ count: completeList.length, offers: list });
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

// ROUTE SEARCH BY ID

router.get("/offer/:id", async (req, res) => {
  try {
    const result = await Offer.findById(req.params.id).populate("creator");

    res.status(200).json({
      _id: result.id,
      created: result.created,
      title: result.title,
      description: result.description,
      price: result.price,
      picture: {
        secure_url: result.picture.secure_url,
      },
      creator: {
        account: {
          username: result.creator.account.username,
          phone: result.creator.account.phone,
        },
        _id: result.creator.id,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

module.exports = router;
