export class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    /**
     * Find all documents in the collection
     * @param {Object} filter - The filter to apply to the query
     * @param {Object} options - The options to apply to the query
     * @returns {Promise<Array>} - The list of documents
     */
    async findAll(filter = {}, options = {}) {
        try {
            const { sort, limit, skip, populate, select } = options;
            let query = this.model.find(filter);

            if (select) query = query.select(select);
            if (sort) query = query.sort(sort);
            if (limit) query = query.limit(limit);
            if (skip) query = query.skip(skip);
            if (populate) query = query.populate(populate);

            return await query.exec();
        } catch (error) {
            throw new Error(`Error finding ${this.model.modelName}: ${error.message}`);
        }
    }

    /**
     * Find a document by its ID
     * @param {string} id - The ID of the document to find
     * @param {Object} options - The options to apply to the query
     * @returns {Promise<Object>} - The document
     */
    async findById(id, options = {}) {
        try {
            let query = this.model.findById(id);
            if (options.select) query = query.select(options.select);
            if (options.populate) query = query.populate(options.populate);
            return await query.exec();
        } catch (error) {
            throw new Error(`Error finding ${this.model.modelName} by ID: ${error.message}`);
        }
    }

    /**
     * Find a document by its ID
     * @param {Object} filter - The filter to apply to the query
     * @param {Object} options - The options to apply to the query
     * @returns {Promise<Object>} - The document
     */
    async findOne(filter, options = {}) {
        try {
            let query = this.model.findOne(filter);
            if (options.select) query = query.select(options.select);
            if (options.populate) query = query.populate(options.populate);
            return await query.exec();
        } catch (error) {
            throw new Error(`Error finding ${this.model.modelName}: ${error.message}`);
        }
    }

    /**
     * Create a new document
     * @param {Object} data - The data to create the document with
     * @returns {Promise<Object>} - The created document
     */
    async create(data) {
        try {
            const document = new this.model(data);
            return await document.save();
        } catch (error) {
            throw new Error(`Error creating ${this.model.modelName}: ${error.message}`);
        }
    }

    /**
     * Update a document by its ID
     * @param {string} id - The ID of the document to update
     * @param {Object} data - The data to update the document with
     * @param {Object} options - The options to apply to the query
     * @returns {Promise<Object>} - The updated document
     */
    async update(id, data, options = {}) {
        try {
            const updateOptions = {
                new: true,
                runValidators: true,
                ...options
            };
            return await this.model.findByIdAndUpdate(id, data, updateOptions);
        } catch (error) {
            throw new Error(`Error updating ${this.model.modelName}: ${error.message}`);
        }
    }

    /**
     * Delete a document by its ID
     * @param {string} id - The ID of the document to delete
     * @returns {Promise<Object>} - The deleted document
     */
    async delete(id) {
        try {
            return await this.model.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Error deleting ${this.model.modelName}: ${error.message}`);
        }
    }

    /**
     * Count the number of documents in the collection
     * @param {Object} filter - The filter to apply to the query
     * @returns {Promise<number>} - The number of documents
     */
    async count(filter = {}) {
        try {
            return await this.model.countDocuments(filter);
        } catch (error) {
            throw new Error(`Error counting ${this.model.modelName}: ${error.message}`);
        }
    }

    /**
     * Check if a document exists in the collection
     * @param {Object} filter - The filter to apply to the query
     * @returns {Promise<boolean>} - Whether a document exists
     */
    async exists(filter) {
        try {
            return await this.model.exists(filter);
        } catch (error) {
            throw new Error(`Error checking existence of ${this.model.modelName}: ${error.message}`);
        }
    }
}