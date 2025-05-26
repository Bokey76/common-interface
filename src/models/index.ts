// src/models/index.ts
import { User } from './user.model';
import { Comment } from './comment.model';

// ✅ 定义关联关系
User.hasMany(Comment, { foreignKey: 'userId', as: 'posts' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

export { User, Comment };
