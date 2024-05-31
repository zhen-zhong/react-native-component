import { useEffect, useRef, useState } from 'react';
import * as RNIap from 'react-native-iap';
import { MyProductList, createPay, appleNotify, getDiamondNum } from './server';
import { Platform } from 'react-native';
import userStore from './userStore';

const IAPHook = () => {
    const isAndroid = Platform.OS === 'android';
    const [inPurchaseList, setInPurchaseList] = useState([]); //商品列表
    const serverOrder = useRef(null)

    useEffect(() => {
        const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(handlePurchaseUpdated);
        const purchaseErrorSubscription = RNIap.purchaseErrorListener(handlePurchaseError);
        return () => {
            serverOrder.current = null
            RNIap.endConnection();
            purchaseUpdateSubscription.remove();
            purchaseErrorSubscription.remove();
        };
    }, []);
    // 支付成功的回调
    const handlePurchaseUpdated = async (purchase) => {
        if (serverOrder.current) {
            console.log('支付成功:', purchase);
        }
        if (purchase.transactionReceipt) {
            RNIap.finishTransaction({ purchase: purchase, isConsumable: true });
            console.log('成功处理标识');
        }
    };
    //支付失败的回调
    const handlePurchaseError = (purchaseError) => {
        console.log('支付失败:', purchaseError);
    };
    // 内购初始化
    const initInPurchase = async () => {
        console.log('内购初始化');
        try {
            const res = await MyProductList({ platform: isAndroid ? 2 : 1, pay_type: 2 });
            if (res.code === 0) {
                setInPurchaseList(res.data);
                await RNIap.getProducts({ skus: res.data.map(item => item.product_id) });
            }
        } catch (err) {
            console.error('获取产品列表失败', err);
        }
    };
    //订阅初始化
    const initSubscribeTo = async () => {
        try {
            const res = await MyProductList({ platform: isAndroid ? 2 : 1, pay_type: 3 });
            if (res.code === 0) {
                setInPurchaseList(res.data);
                await RNIap.initConnection();
                await RNIap.getProducts({ skus: res.data.map(item => item.product_id) });
            }
        } catch (err) {
            console.log('订阅初始化失败：', err);
        }
    };
    // 内购支付
    const handleClickInPurchase = async (productId) => {
        try {
            const res = await createPay({
                pay_type: isAndroid ? 2 : 1,
                product_id: productId,
                order_time: new Date().getTime(),
            })
            if (res.code == 0) {
                serverOrder.current = res.data.order_no;
                const purchase = await RNIap.requestPurchase({ sku: productId, andDangerouslyFinishTransactionAutomaticallyIOS: false });
                console.log('内购成功:', purchase);
                await applePay(purchase.transactionReceipt, purchase.transactionId);
                if (purchase.transactionReceipt) {
                    RNIap.finishTransaction({ purchase: purchase, isConsumable: true });
                }
            }
        } catch (err) {
            console.log('内购失败:', err);
        }
    };
    // 订阅支付
    const handleClickSubscription = async (productId, val) => {
        console.log('productId', productId, val);
        try {
            const res = await createPay({
                pay_type: isAndroid ? 2 : 1,
                product_id: productId,
                order_time: new Date().getTime(),
            })
            if (res.code == 0) {
                serverOrder.current = res.data.order_no;
                const purchase = await RNIap.requestSubscription({ sku: productId });
                console.log('订阅成功:', purchase);
                await applePay(purchase.productId, purchase.transactionReceipt, purchase.transactionId, val);
            }
        } catch (error) {
            console.log('订阅失败:', error);
        }
    };
    const applePay = async (productId, transactionReceipt, transactionId, val) => {
        try {
            const params = {
                order_type: val,
                product_id: productId,
                receipt_data: transactionReceipt,
                receipt_id: transactionId,
                order_no: serverOrder.current,
            };
            const res = await appleNotify(params);
            if (res.code === 0) {
                const res1 = await getDiamondNum({
                    user_id: userStore?.userInfo?.id,
                })
                if (res1.code === 0) {
                    userStore.setDiamond(res.data.crystal_num);
                }
            }
        } catch (err) {

        }

    };
    return {
        inPurchaseList,
        initInPurchase,
        initSubscribeTo,
        handleClickInPurchase,
        handleClickSubscription
    };
};

export default IAPHook;
