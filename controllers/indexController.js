exports.getIndexPage = (req, res) => {
  const flashMessage = req.flash("info");

  res.render("index", { flashMessage: flashMessage.length > 0 ? flashMessage : null });
};
