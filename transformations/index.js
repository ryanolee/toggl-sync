
/**
 * @typedef layer
 * @type {object}
 * @property {function} apply Applies a transformation to a data item returning a transformed item 
 */

/**
 * This class represents a series of transformations that are given in layers.
 * 
 * Each layer is a object that has an apply method bound to it. The apply method is called to bind a 
 */
class Transformation {
	/**
	 * @param {layer[]} layers 
	 */
	constructor(layers){
		this.layers =  layers;
	}

	async applyToDataItem(data){
		for(let layer of this.layers){
			data = await layer.apply(data);
			console.log(data.length);
		}
		return data;
	}

	async apply(dataArray){
		let isIter = (dataArray != null && typeof dataArray[Symbol.iterator] === 'function');
		dataArray = isIter ? dataArray : [dataArray];
		let transformedTaskData = []
		for(let data of dataArray){
			transformedTaskData.push(await this.applyToDataItem(data))
		}
		return transformedTaskData;
	}
}

module.exports = Transformation;

