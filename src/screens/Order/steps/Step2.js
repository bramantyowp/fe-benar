import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    Alert,
    Modal,
    Image,
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { selectOrder, setStateByName, putOrderSlip } from '../../../redux/reducers/order';
import { selectCarDetails } from '../../../redux/reducers/cars';
import { selectUser } from '../../../redux/reducers/user';

import CarList from '../../../components/CarList';
import Button from '../../../components/Button';
import Icon from 'react-native-vector-icons/Feather';
import CountDown from 'react-native-countdown-component-maintained';
import formatCurrency from '../../../utils/formatCurrency';
import ModalPopup from '../../../components/Modal/Modal';

function getDate24() {
    const date24 = new Date(); // your date object
    date24.setHours(date24.getHours() + 24);
    return date24.toString();
}

export default function Step2() {
    const [promoText, setPromoText] = useState(null);
    const { data, selectedBank, errorMessage, isModalVisible, status } = useSelector(selectOrder);
    const user = useSelector(selectUser);

    const [image, setImage] = useState(null);

    const dispatch = useDispatch();

    // const copyToClipboard = async (text) => {
    //     const str = text.toString();
    //     await Clipboard.setStringAsync(str);
    // };

    // const pickImage = async () => {
    //     let result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.All,
    //         allowsEditing: true,
    //         aspect: [4, 3],
    //         quality: 0.2,
    //     });

    //     console.log(result);

    //     if (!result.canceled) {
    //         setImage({
    //             uri: result.assets[0].uri,
    //             name: result.assets[0].fileName,
    //             type: result.assets[0].mimeType,
    //         });
    //     }
    // };

    const handleUpload = () => {
        console.log('upload');
        if (image) {
            const formData = new FormData();
            formData.append('slip', image);
            dispatch(putOrderSlip({
                token: user.data.access_token,
                id: data.id,
                formData,
            }));
        }
    };

    useEffect(() => {
        if (status === 'upload-success') {
            console.log(data);
            dispatch(setStateByName({ name: 'activeStep', value: 2 }));
        } else {
            console.log(errorMessage);
        }
    }, [status]);

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.countDownWrapper}>
                    <Text style={styles.countDownText}>
                        Selesaikan Pembayaran Sebelum
                    </Text>
                    <CountDown
                        until={86400}
                        digitStyle={{ backgroundColor: '#FA2C5A' }}
                        digitTxtStyle={{ color: '#fff' }}
                        timeLabelStyle={{ display: 'none' }}
                        onFinish={() => Alert('finished')}
                        timeToShow={['H', 'M', 'S']}
                        size={12}
                    />
                </View>
                <Text style={styles.countDownDate}>{getDate24()}</Text>
                <CarList
                    image={{ uri: data.image }}
                    carName={data.name}
                    passengers={5}
                    baggage={4}
                    price={data.price}
                />
                <Text style={styles.textBold}>Lakukan Transfer Ke</Text>
                <View
                    style={{
                        marginBottom: 10,
                    }}
                >
                    <View style={styles.paymentMethod}>
                        <Text style={styles.paymentBox}>{selectedBank?.bankName}</Text>
                        <View style={styles.paymentText}>
                            <Text>{selectedBank?.bankName} Transfer</Text>
                            <Text>{selectedBank?.name}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.readOnlyInputWrapper}>
                    <Text>Nomor Rekening</Text>
                    <View style={styles.readOnlyInput}>
                        <Text style={styles.readOnlyInputText}>12345678</Text>
                        <Pressable>
                            <Icon color={'#3C3C3C'} name={'copy-outline'} size={14} />
                        </Pressable>
                    </View>
                </View>
                <View style={styles.readOnlyInputWrapper}>
                    <Text>Total Bayar</Text>
                    <View style={styles.readOnlyInput}>
                        <Text style={styles.readOnlyInputText}>
                            {formatCurrency.format(data.price)}
                        </Text>
                        <Pressable>
                            <Icon color={'#3C3C3C'} name={'copy-outline'} size={14} />
                        </Pressable>
                    </View>
                </View>
            </View>

            <ModalPopup
                isVisible={isModalVisible}
                onClose={() => {
                    dispatch(setStateByName({ name: 'isModalVisible', value: false }));
                }}
            >
                <Text style={styles.textBold}>Konfirmasi Pembayaran</Text>
                <Text style={styles.textBold}>
                    Terima kasih telah melakukan konfirmasi pembayaran. Pembayaranmu akan
                    segera kami cek tunggu kurang lebih 10 menit untuk mendapatkan
                    konfirmasi.
                </Text>
                <CountDown
                    until={600}
                    digitStyle={{ backgroundColor: '#FA2C5A' }}
                    digitTxtStyle={{ color: '#fff' }}
                    timeLabelStyle={{ display: 'none' }}
                    onFinish={() => Alert('finished')}
                    timeToShow={['M', 'S']}
                    size={12}
                />
                <Text style={styles.textBold}>Pembayaran</Text>
                <Text style={styles.textBold}>
                    Untuk membantu kami lebih cepat melakukan pengecekan. Kamu bisa upload
                    bukti bayarmu
                </Text>
                <Pressable style={styles.uploadImage} onPress={pickImage}>
                    {image ? (
                        <Image
                            source={{ uri: image.uri }}
                            resizeMode="cover"
                            width={'100%'}
                            height={300}
                            style={styles.image}
                        />
                    ) : (
                        <View style={styles.iconUpload}>
                            <Icon color={'#3C3C3C'} name={'image-outline'} size={14} />
                        </View>
                    )}
                </Pressable>
                <Button
                    title="Upload"
                    color="#3D7B3F"
                    onPress={handleUpload}
                />
            </ModalPopup>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    textBold: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        marginBottom: 10,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderWidthBottom: 1,
        borderColorBottom: '#D0D0D0',
    },
    paymentBox: {
        width: '30%',
        textAlign: 'center',
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderColor: '#D0D0D0',
        marginRight: 10,
    },
    check: {
        marginLeft: 'auto',
    },
    promosForm: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    promoInput: {
        borderWidth: 1,
        paddingHorizontal: 10,
        borderColor: '#000',
        width: '70%',
    },
    promoButton: {
        width: '30%',
        borderWidth: 1,
        borderColor: '#3D7B3F',
    },
    promoTextWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    promoText: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
    },
    countDownWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    countDownText: {
        fontFamily: 'PoppinsBold',
        fontSize: 17,
    },
    countDownDate: {
        fontFamily: 'PoppinsBold',
        fontSize: 14,
        marginBottom: 10,
    },
    uploadImage: {
        height: 400,
        backgroundColor: '#D0D0D0',
    },
    image: {
        height: 400,
        width: 'auto',
    },
    readOnlyInput: {
        marginVertical: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#D0D0D0',
    },
    readOnlyInputText: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
    },
});
