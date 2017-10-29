import memberState from './memberState';
import OrderChannel from '../channels/order';

const sessionkey = 'basketTemp';
const orderChannel = new OrderChannel();
export default class BasketTemp {
    static clear() {
        wx.clearStorage()
        sessionStorage.removeItem(sessionkey)
    }
    static addBasket(productId, specificateId, volume, location, image) {
        if (memberState.isLogin()) {
             orderChannel.addBasket(productId.toString(), specificateId.toString(), volume.toString(), location, image);
        }
        else {
            const jsonStr = sessionStorage.getItem(sessionkey);
            let basketTempData = { productIdArray: [], specificateIdArray: [], volumeArray: [], locationArray: [], imageArray: [] }
            if (jsonStr) {
                basketTempData = JSON.parse(jsonStr);
            }
            let index = basketTempData.specificateIdArray.indexOf(specificateId);
            if (index < 0) {
                basketTempData.productIdArray.push(productId);
                basketTempData.specificateIdArray.push(specificateId);
                basketTempData.volumeArray.push(volume);
                basketTempData.locationArray.push(location);
                basketTempData.imageArray.push(image);
            }
            else {
                basketTempData.volumeArray[index] = basketTempData.volumeArray[index] + volume;
            }
            sessionStorage.setItem(sessionkey, JSON.stringify(basketTempData));
        }
    }
    static async getBasketVolume() {
        let volume = 0;
        if (MemberLoginState.isLogin()) {
            const orderChannel = new OrderChannel();
            volume = await orderChannel.getBasketVolume();
        }
        else {
            const jsonStr = sessionStorage.getItem(sessionkey);
            if (jsonStr) {
                let basketTempData = JSON.parse(jsonStr);
                for (let subvolume of basketTempData.volumeArray) {
                    volume += subvolume;
                }
            }
        }
        return volume;
    }
    static async tempToApi() {
        let result = false;
        const jsonStr = sessionStorage.getItem(sessionkey);
        if (!jsonStr) {
            return false;
        }
        let basketTempData = JSON.parse(jsonStr);
        if (MemberLoginState.isLogin() && basketTempData !== null && basketTempData.productIdArray.length > 0) {
            const orderChannel = new OrderChannel();
            let result = await orderChannel.addBasket(basketTempData.productIdArray.join(','), basketTempData.specificateIdArray.join(','), basketTempData.volumeArray.join(','), basketTempData.locationArray.join(','), basketTempData.imageArray.join(','));
            if (result) {
                BasketTemp.clear();
            }
        }
        return result;
    }
}

