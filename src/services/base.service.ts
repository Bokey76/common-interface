import { sequelize,Sequelize } from "../database";
const Models = sequelize.models // 所有sequelize注册model的集合

export default {

    // 获取
    getAll: async (MainModel:string) => {
        console.log(sequelize.models);
        console.log(Models[MainModel].getAttributes());
        const result = await Models[MainModel].findAll()
        return result
    },


    // 创建
    create: async(MainModel:string,data:Object) => {
        const result = await Models[MainModel].create(data)
        return result
    },


    // 修改


    // 删除


}