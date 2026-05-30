const prisma = require("../../lib/prisma");

async function getCategories() {
    const categories = await prisma.tag.findMany({
        orderBy: {
            name: "asc"
        }
    });

    return categories;
}

async function postCategory(data) {
    const { name } = data;
    const categoryData = await prisma.tag.create({
        data: {
            name: name
        }
    });

    return categoryData;
}

async function updateCategory(id, data) {
    const { name } = data;
    const categoryData = await prisma.tag.update({
        where: {
            id: id
        },
        data: {
            name: name
        }
    });

    return categoryData;
}

async function deleteCategory(id) {
    const categoryData = await prisma.tag.delete({
        where: {
            id: id
        }
    });

    return categoryData;
}

module.exports = {
    getCategories,
    postCategory,
    updateCategory,
    deleteCategory
}