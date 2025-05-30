import * as auth from './auth'
import * as relations from "./relations";
import { Comment } from "./comment.model";
import { Article } from "./article.model";
import { Tag } from "./tag.model";

// ✅ 定义关联关系
auth.User.hasMany(Comment, { foreignKey: "userId" });
auth.User.hasMany(Article, { foreignKey: "userId" });
auth.User.belongsToMany(auth.Role,{
  through: relations.UserRole,
  foreignKey: "userId",
  otherKey: "roleId",
})

auth.Role.belongsToMany(auth.User,{
  through: relations.UserRole,
  foreignKey: "roleId",
  otherKey: "userId",
})
auth.Role.belongsToMany(auth.Permission,{
  through: relations.RolePermission,
  foreignKey: "roleId",
  otherKey: "permissionId",
})

auth.Permission.belongsToMany(auth.Role,{
  through: relations.RolePermission,
  foreignKey: "permissionId",
  otherKey: "roleId",
})

Comment.belongsTo(auth.User, { foreignKey: "userId" });
Comment.belongsTo(Article, { foreignKey: "articleId" });

Article.belongsTo(auth.User, { foreignKey: "userId" });
Article.hasMany(Comment, { foreignKey: "articleId" });
Article.belongsToMany(Tag, {
  through: relations.ArticleTag,
  foreignKey: "articleId",
  otherKey: "tagId",
});

Tag.belongsToMany(Article, {
  through: relations.ArticleTag,
  foreignKey: "tagId",
  otherKey: "articleId",
});

export { auth, Comment, Article, Tag };
export * from './auth';
export * from './relations'
