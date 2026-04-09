import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import {
  addDoc,
  arrayRemove,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore/lite';

type CartCourse = {
  id: string;
  title: string;
  author: string;
  imageUrl?: string;
  price: number;
};

export default function CartScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [items, setItems] = useState<CartCourse[]>([]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);

  const loadCart = async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) {
        setItems([]);
        return;
      }

      const userData = userSnapshot.data();
      const cartIds = Array.isArray(userData?.cartCourseIds)
        ? userData.cartCourseIds.filter((id: unknown): id is string => typeof id === 'string')
        : [];

      if (cartIds.length === 0) {
        setItems([]);
        return;
      }

      const courseSnapshots = await Promise.all(cartIds.map((courseId) => getDoc(doc(db, 'courses', courseId))));
      const cartItems = courseSnapshots
        .filter((snapshot) => snapshot.exists())
        .map((snapshot) => {
          const data = snapshot.data();
          return {
            id: snapshot.id,
            title: data.title || 'Untitled Course',
            author: data.author || data.instructor || 'Course Instructor',
            imageUrl: data.imageUrl || data.image || data.thumbnail,
            price: Number(data.price || 0),
          };
        });

      setItems(cartItems);
    } catch (error) {
      console.error('Failed to load cart:', error);
      Alert.alert('Error', 'Could not load cart items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user?.id]);

  const removeFromCart = async (courseId: string) => {
    if (!user?.id) return;

    setItems((prev) => prev.filter((item) => item.id !== courseId));
    try {
      const userRef = doc(db, 'users', user.id);
      const payload = { cartCourseIds: arrayRemove(courseId) };

      try {
        await updateDoc(userRef, payload);
      } catch {
        await setDoc(userRef, payload, { merge: true });
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      Alert.alert('Error', 'Could not remove item from cart.');
      await loadCart();
    }
  };

  const handleCheckout = async () => {
    if (!user?.id || items.length === 0) {
      return;
    }

    setCheckoutLoading(true);
    try {
      await Promise.all(
        items.map(async (item) => {
          await addDoc(collection(db, 'purchases'), {
            userId: user.id,
            courseId: item.id,
            title: item.title,
            author: item.author,
            amount: item.price,
            paymentStatus: 'completed',
            status: 'active',
            purchasedAt: new Date(),
          });

          await addDoc(collection(db, 'enrollments'), {
            userId: user.id,
            courseId: item.id,
            enrollmentDate: new Date(),
            amount: item.price,
            status: 'active',
            paymentStatus: 'completed',
          });
        })
      );

      const userRef = doc(db, 'users', user.id);
      try {
        await updateDoc(userRef, { cartCourseIds: [] });
      } catch {
        await setDoc(userRef, { cartCourseIds: [] }, { merge: true });
      }

      setItems([]);
      Alert.alert('Purchase successful', 'All cart items were purchased.', [
        {
          text: 'View Purchases',
          onPress: () => router.push('/profile/purchases'),
        },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (error) {
      console.error('Checkout failed:', error);
      Alert.alert('Checkout failed', 'Could not complete checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#0F172A" />
          <Text style={styles.stateText}>Loading cart...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="cart-outline" size={58} color="#94A3B8" />
          <Text style={styles.stateTitle}>Your cart is empty</Text>
          <Text style={styles.stateText}>Add courses from the detail page to purchase them here.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/')}>
            <Text style={styles.primaryBtnText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.listContent}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.thumbWrap}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Ionicons name="school-outline" size={24} color="#5B6BFF" />
                    </View>
                  )}
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemAuthor}>by {item.author}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                </View>

                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.checkoutBar}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutBtn, checkoutLoading && styles.checkoutBtnDisabled]}
              onPress={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.checkoutBtnText}>Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerRight: {
    width: 38,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 8,
  },
  stateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 290,
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 130,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumbWrap: {
    width: 78,
    height: 78,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemAuthor: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },
  itemPrice: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
  },
  checkoutBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  totalValue: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  checkoutBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  checkoutBtnDisabled: {
    opacity: 0.7,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
