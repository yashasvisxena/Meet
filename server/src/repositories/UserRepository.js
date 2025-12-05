import { BaseRepository } from "./baseRepository.js";
import { User } from "../models/user.model.js";

export class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<User>} - Found user object
     */
    async findByEmail(email) {
        return await this.findOne({ email });
    }

    /**
     * Find user by email or phone
     * @param {string} email - User email
     * @param {string} phoneNumber - User phone number
     * @returns {Promise<User>} - Found user object
     */
    async findByEmailOrPhone(email, phoneNumber) {
        const conditions = [{ email }];
        if (phoneNumber && phoneNumber.trim() !== "") {
            conditions.push({ phoneNumber });
        }
        return await this.findOne({ $or: conditions });
    }

    /**
     * Find user by Google ID
     * @param {string} googleId - User Google ID
     * @returns {Promise<User>} - Found user object
     */
    async findByGoogleId(googleId) {
        return await this.findOne({ googleId });
    }

    /**
     * Find user by email or Google ID
     * @param {string} email - User email
     * @param {string} googleId - User Google ID
     * @returns {Promise<User>} - Found user object
     */
    async findByEmailOrGoogleId(email, googleId) {
        return await this.findOne({ $or: [{ email }, { googleId }] });
    }

    /**
     * Find user by ID without sensitive fields
     * @param {string} id - User ID
     * @returns {Promise<User>} - Found user object
     */
    async findByIdSafe(id) {
        return await this.findById(id, {
            select: "-password -refreshToken"
        });
    }

    /**
     * Create user and return without sensitive data
     * @param {Object} userData - User data to create
     * @returns {Promise<User>} - Created user object
     */
    async createUser(userData) {
        const user = await this.create(userData);
        const { password, refreshToken, ...userWithoutSensitiveData } = user.toObject();

        if (!userWithoutSensitiveData.phoneNumber) {
            userWithoutSensitiveData.phoneNumber = null;
        }

        return userWithoutSensitiveData;
    }

    /**
     * Update user by ID
     * @param {string} userId - User ID
     * @param {Object} updates - Updates to apply
     * @param {Object} options - Options for the update
     * @returns {Promise<User>} - Updated user object
     */
    async updateById(userId, updates, options = {}) {
        return await this.update(userId, updates, {
            new: true,
            runValidators: true,
            ...options
        });
    }

    /**
     * Update refresh token
     * @param {string} userId - User ID
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<User>} - Updated user object
     */
    async updateRefreshToken(userId, refreshToken) {
        return await this.update(userId, { refreshToken }, {
            new: true,
            validateBeforeSave: false
        });
    }

    /**
     * Clear refresh token
     * @param {string} userId - User ID
     * @returns {Promise<User>} - Updated user object
     */
    async clearRefreshToken(userId) {
        return await this.model.findByIdAndUpdate(
            userId,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );
    }

    /**
     * Find user by wallet ID
     * @param {string} walletId - Wallet ID
     * @returns {Promise<User>} - Found user object
     */
    async findByWalletId(walletId) {
        return await this.findOne({ walletId });
    }

    /**
     * Check if email exists
     * @param {string} email - Email to check
     * @returns {Promise<boolean>} - True if email exists, false otherwise
     */
    async emailExists(email) {
        return await this.exists({ email });
    }

    /**
     * Check if phone exists
     * @param {string} phoneNumber - Phone number to check
     * @returns {Promise<boolean>} - True if phone exists, false otherwise
     */
    async phoneExists(phoneNumber) {
        return await this.exists({ phoneNumber });
    }

    /**
     * Get users with pagination
     * @param {Object} filter - Filter criteria
     * @param {number} page - Page number
     * @param {number} limit - Number of items per page
     * @param {string} sortBy - Sorting criteria
     * @returns {Promise<{ users: Array<User>, pagination: Object }>} - Users and pagination data
     */
    async findWithPagination(filter = {}, page = 1, limit = 10, sortBy = "-createdAt") {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.findAll(filter, {
                skip,
                limit,
                sort: sortBy,
                select: "-password -refreshToken"
            }),
            this.count(filter)
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        };
    }

    /**
     * Find all active users
     * @param {Object} options - Options for the query
     * @returns {Promise<Array<User>>} - Array of active users
     */
    async findActiveUsers(options = {}) {
        return await this.findAll(
            { isActive: true },
            { select: "-password -refreshToken", ...options }
        );
    }
}

const userRepositoryInstance = new UserRepository();
export { userRepositoryInstance as userRepository };

export default UserRepository;