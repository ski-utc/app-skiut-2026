import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Check } from 'lucide-react-native';

interface BoutonDefiProps {
    defi: {
        id: number,
        title: string,
        points: number,
        status: string,
        [key: string]: any;
    };
}

const BoutonDefi: React.FC<BoutonDefiProps> = ({ defi, onUpdate }) => {
    const navigation = useNavigation();

    const onPress = () => {
        navigation.navigate("defisInfos", {
            id: defi.id,
            title: defi.title,
            points: defi.points,
            status: defi.status,
            onUpdate
        });
    };
    

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: "100%",
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 14,
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#EAEAEA",
                justifyContent: "space-between",
                alignItems: "center",
                display: "flex",
                flexDirection: "row",
                backgroundColor: 'white',
            }}
        >
            {/* Left section: Icon and title */}
            <View
                style={{
                    justifyContent: "flex-start",
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "row",
                    width: '85%',
                }}
            >
                <Check
                    color={defi.status !== 'empty' ? (defi.status === 'done' ? 'green' : 'orange') : '#8A8A8A'}
                    size={20}
                    strokeWidth={4}
                />
                <Text
                    style={{
                        color: "#1E1E1E",
                        fontSize: 14,
                        fontFamily: Fonts.Inter.Basic,
                        fontWeight: "500",
                        marginLeft: 10,
                    }}
                >
                    {defi.title}
                </Text>
            </View>

            {/* Right section: Chevron icon */}
            <ChevronRight size={40} color={Colors.black} />
        </TouchableOpacity>
    );
};

export default BoutonDefi;