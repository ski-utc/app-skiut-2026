import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Header from "../../components/header";
import * as Linking from 'expo-linking';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import BoutonRetour from "../../components/divers/boutonRetour";
import { Phone } from "lucide-react-native";
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

interface ContactInterface {
    name: string;
    role?: string | null;
    phoneNumber: string;
}

export default function Contact() {
    const [contacts, setContacts] = useState<ContactInterface[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const { setUser } = useUser();

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiGet('getContacts');
            if (response.success) {
                setContacts(response.data);
            } else {
                setError(response.message);
            }
        } catch (error: any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const makeCall = (phoneNumber: string) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const renderItem = ({ item }: { item: ContactInterface }) => (
        <TouchableOpacity
            style={styles.contactCard}
            onPress={() => makeCall(item.phoneNumber)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Phone size={18} color={Colors.primary} />
                </View>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.contactName} numberOfLines={2}>
                    {item.name}
                </Text>
                {item.role && (
                    <Text style={styles.contactRole} numberOfLines={1}>
                        {item.role}
                    </Text>
                )}
                <Text style={styles.contactPhone} numberOfLines={1}>
                    {item.phoneNumber}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (error) {
        return (
            <ErrorScreen error={error} />
        );
    }

    if (loading) {
        return (
            <View style={{
                flex: 1,
                backgroundColor: Colors.white,
            }}>
                <Header refreshFunction={undefined} disableRefresh={true} />
                <View style={{
                    width: '100%',
                    flex: 1,
                    backgroundColor: Colors.white,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <ActivityIndicator size="large" color={Colors.primaryBorder} />
                    <Text style={[TextStyles.body, { color: Colors.muted, marginTop: 16 }]}>
                        Chargement...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header refreshFunction={null} disableRefresh={true} />
            <View style={styles.content}>
                <BoutonRetour
                    previousRoute={"homeNavigator"}
                    title={"Contact"}
                />
                <FlatList
                    data={contacts}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Aucun contact disponible
                            </Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    loadingContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        ...TextStyles.body,
        color: Colors.muted,
        marginTop: 16,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    contactCard: {
        flex: 1,
        backgroundColor: Colors.white,
        marginHorizontal: 6,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 2, height: 3 },
        shadowRadius: 5,
        elevation: 3,
        minHeight: 120,
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.lightMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactName: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontWeight: '600',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 4,
        lineHeight: 18,
    },
    contactRole: {
        ...TextStyles.small,
        color: Colors.primary,
        fontWeight: '500',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 6,
    },
    contactPhone: {
        ...TextStyles.small,
        color: Colors.muted,
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: {
        ...TextStyles.bodyLarge,
        color: Colors.muted,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});