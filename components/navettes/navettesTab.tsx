import React, { useState, useCallback } from 'react';
import { Text, View, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Colors } from '@/constants/GraphSettings';

interface Navette {
    aller_ou_retour: string;
    depart: string;
    destination: string;
    heureDeDepart: string;
    couleur: string;
}

interface NavettesTabProps {
    navettesMap: { [key: string]: Navette[] };
}

const NavetteTab: React.FC<NavettesTabProps> = ({ navettesMap }) => {
    const [selectedType, setSelectedType] = useState<"Aller" | "Retour" | "">("");

    const handlePress = useCallback((type: "Aller" | "Retour") => {
        setSelectedType(type);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.buttonsContainer}>
                    {["Aller", "Retour"].map((type, index) => {
                        const isSelected = selectedType === type;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    { backgroundColor: isSelected ? Colors.orange : Colors.white }
                                ]}
                                onPress={() => handlePress(type as "Aller" | "Retour")}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    { color: isSelected ? Colors.white : Colors.black }
                                ]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {selectedType && (
                    <View style={styles.navettesContainer}>
                        <FlatList
                            data={navettesMap[selectedType] || []}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.navetteContainer}>
                                    <View style={[styles.navetteIndicator, { backgroundColor: item.couleur }]} />
                                    <View style={styles.navetteDetails}>
                                        <Text style={styles.navetteTime}>
                                            {item.heureDeDepart}
                                        </Text>
                                        <Text style={styles.navetteText}>
                                            {item.depart} - {item.destination}
                                        </Text>
                                        <Text style={styles.navetteCouleurText}>
                                            Navette {item.couleur}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            style={styles.navettesList}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        backgroundColor: Colors.white
    },
    innerContainer: {
        paddingHorizontal: 5,
        paddingBottom: 16,
        flex: 1
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "90%",
        marginTop: 5,
        height: 60,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.orange,
        alignSelf: "center"
    },
    button: {
        flex: 1,
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText: {
        fontSize: 16,
        fontFamily: "Inter",
        fontWeight: "600"
    },
    navettesContainer: {
        flex: 1,
        width: "90%",
        alignSelf: "center",
        marginTop: 10
    },
    navettesList: {
        flex: 1
    },
    navetteContainer: {
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.customGray,
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'row'
    },
    navetteIndicator: {
        width: 5,
        height: 50,
        borderRadius: 3,
        marginRight: 10
    },
    navetteDetails: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },
    navetteTime: {
        color: Colors.black,
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '600'
    },
    navetteText: {
        color: Colors.gray,
        fontSize: 12,
        fontFamily: 'Inter',
        fontWeight: '400'
    },
    navetteCouleurText: {
        color: Colors.gray,
        fontSize: 12,
        fontFamily: 'Inter',
        fontWeight: '400'
    }
});

export default NavetteTab;
