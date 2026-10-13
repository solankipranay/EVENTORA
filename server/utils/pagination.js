const parsePagination = (query) => {
    const requestedPage = typeof query.page === 'string' ? Number.parseInt(query.page, 10) : 1;
    const requestedLimit = typeof query.limit === 'string' ? Number.parseInt(query.limit, 10) : 25;
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 25;

    return { page, limit, skip: (page - 1) * limit };
};

module.exports = parsePagination;
