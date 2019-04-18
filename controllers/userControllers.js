// name the controllers in this format '<method of request><Name of the route>'

const postSubmit = async (req, res) => {
  try {
    res.status(201).send('Report added to DB');
  } catch (e) {
    res.status(400).send(e);
  }
};

const getReports = async (req, res) => {
  try {
    res.status(200).send('Getting all reports!');
  } catch (e) {
    res.status(400).send(e);
  }
};

const getReportsID = async (req, res) => {
  try {
    res.status(200).send(`Getting report with id ${req.params.id}`);
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = {
  postSubmit,
  getReports,
  getReportsID
};
