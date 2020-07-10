const express = require("express");
const User = require("../models/User.js");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      // Récupération du token envoyé et clean
      const token = req.headers.authorization.replace("Bearer ", "");

      // Recherche de l'utilisateur dans la bdd
      const userFound = await User.findOne({ token: token });

      // Si token (donc user) trouvé, recupérer l'id puis next()
      if (userFound) {
        req.fields.userRefId = userFound.id;
        next();
      } else {
        // Sinon, renvoyer non autorisé
        return res.status(401).json("Unauthorized");
      }
    } else {
      return res.status(401).json("Unauthorized");
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
};

module.exports = isAuthenticated;
