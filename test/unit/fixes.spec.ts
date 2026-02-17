
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/module/user/user.service';
import { PostService } from '../../src/module/post/post.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../src/Schema/user.schema';
import { Post } from '../../src/Schema/post.schema';
import { Session } from '../../src/Schema/session.schema';
import { Comment } from '../../src/Schema/comment.schema';
import { Like } from '../../src/Schema/like.schema';
import { PostView } from '../../src/Schema/postView.schema';
import { AuthTokenService } from '../../src/module/auth/auth-token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppError } from '../../src/Utils/AppError';

// Mock Mongoose Model Class
class MockModel {
    constructor(public data: any) { Object.assign(this, data); }
    save = jest.fn().mockResolvedValue(this);
    toObject = jest.fn().mockReturnValue(this);
    populate = jest.fn().mockResolvedValue(this);

    static find = jest.fn().mockReturnThis();
    static findOne = jest.fn().mockReturnThis();
    static findById = jest.fn().mockReturnThis();
    static findByIdAndUpdate = jest.fn().mockReturnThis();
    static updateOne = jest.fn().mockReturnThis();
    static deleteOne = jest.fn().mockReturnThis();
    static deleteMany = jest.fn().mockReturnThis();
    static exists = jest.fn();
    static countDocuments = jest.fn();
    static skip = jest.fn().mockReturnThis();
    static limit = jest.fn().mockReturnThis();
    static select = jest.fn().mockReturnThis(); // For user.select("+password")
}

// Ensure methods return 'this' or promise where expected
MockModel.findOne = jest.fn().mockImplementation(() => ({
    select: jest.fn().mockResolvedValue(null), // Default
    populate: jest.fn().mockResolvedValue(null),
}));
MockModel.find = jest.fn().mockImplementation(() => ({
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockResolvedValue([]),
    lean: jest.fn().mockResolvedValue([]),
}));

const mockAuthTokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
};

const mockJwtService = {
    verify: jest.fn(),
};

const mockConfigService = {
    get: jest.fn(),
};

describe('Fixes Verification Unit Tests', () => {
    let userService: UserService;
    let postService: PostService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                PostService,
                { provide: getModelToken(User.name), useValue: MockModel },
                { provide: getModelToken(Post.name), useValue: MockModel },
                { provide: getModelToken(Session.name), useValue: MockModel },
                { provide: getModelToken(Comment.name), useValue: MockModel },
                { provide: getModelToken(Like.name), useValue: MockModel },
                { provide: getModelToken(PostView.name), useValue: MockModel },
                { provide: AuthTokenService, useValue: mockAuthTokenService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        userService = module.get<UserService>(UserService);
        postService = module.get<PostService>(PostService);

        // Reset specific mocks if needed
        MockModel.find.mockClear();
        MockModel.findOne.mockClear();
    });

    describe('UserService', () => {
        it('should enable duplicate user checks', async () => {
            // Mock findOne to return a user (simulate duplicate)
            MockModel.findOne.mockResolvedValueOnce({ _id: 'existing' });

            try {
                await userService.registeruser({
                    userName: 'test', email: 'test@example.com', password: 'pass', fullName: 'Test', role: 'user'
                } as any);
                fail('Should have thrown error for duplicate username');
            } catch (e) {
                expect(e).toBeInstanceOf(AppError);
                expect(e.message).toContain('userName already exists');
            }
        });
    });

    describe('PostService', () => {
        it('should use safe slug generation (regex & random)', async () => {
            const user = { _id: 'userId', userName: 'authorUser', role: 'author' } as any;
            const data = { title: 'Test  Title! @#', content: 'content', status: 'published', tags: [], category: 'tech' } as any;

            // Mock find to return empty for slug check
            MockModel.find.mockResolvedValue([]);

            await postService.createPost(data, user);

            // Check the slug in the constructor call of PostModel
            // Since we mocked the class, we can check calls to the constructor?
            // In Jest, checking constructor calls on a class provided as value is tricky if it's not a spy.
            // But we can check if save was called on an instance.

            // Actually, MockModel is the value. 
            // When `new this.postModel()` is called, it calls `new MockModel()`.

            // Since we can't easily spy on the constructor of the provided value without replacing it with a jest.fn()...
            // Let's verify the slug generation by checking `postWithSameSlug` query or just the logic via spy?
            // `this.postModel.find({ slug: slug })` is called.

            const findCall = MockModel.find.mock.calls[0];
            const slugQuery = findCall[0].slug;

            expect(slugQuery).toContain('test-title-'); // Spaces replaced by dashes, special chars removed
            expect(slugQuery).not.toContain('!');
            expect(slugQuery).not.toContain('@');
            expect(slugQuery).toContain('-by-authorUser-');
        });

        it('should escape regex characters in search', async () => {
            const query = { category: '(a+)+' };
            const user = { _id: 'userId' } as any;

            // Mock response
            MockModel.find.mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue([]),
            });

            await postService.getAllPublishedPosts(query, user);

            // Arguments to find
            const findArgs = MockModel.find.mock.calls[0][0];
            // Filter should involve OR condition with regex
            const orConditions = findArgs.$or;
            const categoryCondition = orConditions.find(c => c.category);
            const regex = categoryCondition.category;

            expect(regex).toBeInstanceOf(RegExp);
            // (a+)+ should be escaped to \(a\+\)\+
            // source property of regex:
            expect(regex.source).toContain('\\(a\\+\\)\\+');
        });

        it('should allow finding draft posts for update', async () => {
            const user = { _id: 'userId' } as any;
            const postId = 'postId';
            const updateData = { title: 'Updated' } as any;

            // Mock findOne to return a DRAFT post (simulated)
            const mockPost = new MockModel({ _id: postId, author: { id: 'userId' }, status: 'draft' });
            MockModel.findOne.mockReturnValue(mockPost);

            // Populate mock
            mockPost.populate.mockResolvedValue({
                ...mockPost,
                author: { id: 'userId', toString: () => 'userId' },
                toObject: () => mockPost
            });

            // Call updatePost with draftToPublish = false
            await postService.updatePost(updateData, postId as any, user, false);

            // Verify findOne was called WITHOUT status: 'published' constraint
            const findOneArgs = MockModel.findOne.mock.calls[0][0];
            expect(findOneArgs).toEqual({ _id: postId });
            expect(findOneArgs.status).toBeUndefined(); // Should NOT enforce status 'published'
        });
    });
});
