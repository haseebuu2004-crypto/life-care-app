const getOwnerId = (req) => {
    // Rely strictly on db-enforced owner_id
    return req.user.owner_id || req.user.id;
};

module.exports = { getOwnerId };
