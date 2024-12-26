import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';

// @ts-ignore
export default function BoutonProfil ({ nextRoute, options }) {
    const navigation = useNavigation();
    const IconComponent = options.icon;

    const onPress = () => {
        navigation.navigate(nextRoute);
    };

    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={styles.leftSection}>
                <View style={styles.icon}>
                    {IconComponent && (
                        <IconComponent
                            size={20}
                            color={Colors.gray}
                        />
                    )}
                </View>
                <Text style={styles.title}>{options.title}</Text>
            </View>
            <ChevronRight size={20} color={Colors.black} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#EAEAEA",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
        gap:10
    },
    title: {
        color: "#1E1E1E",
        fontSize: 16,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: "500",
        flex: 8
    },
    icon: {
        flex:1,
        alignItems: "center"
    }
});