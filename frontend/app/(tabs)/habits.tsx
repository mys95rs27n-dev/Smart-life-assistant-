import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { api } from '../../utils/api';
import { format } from 'date-fns';

const ICON_OPTIONS = [
  'water', 'fitness', 'moon', 'book', 'cafe', 'walk',
  'basketball', 'bicycle', 'restaurant', 'medical'
];

const COLOR_OPTIONS = [
  '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export default function Habits() {
  const { habits, setHabits } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    icon: 'star',
    color: '#4CAF50',
    frequency: 'daily' as 'daily' | 'weekly',
  });

  const loadHabits = async () => {
    try {
      const data = await api.getHabits();
      setHabits(data);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleCreateHabit = async () => {
    if (!newHabit.name.trim()) return;

    try {
      await api.createHabit(newHabit);
      await loadHabits();
      setModalVisible(false);
      setNewHabit({
        name: '',
        description: '',
        icon: 'star',
        color: '#4CAF50',
        frequency: 'daily',
      });
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      await api.completeHabit(habitId);
      await loadHabits();
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await api.deleteHabit(habitId);
      await loadHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const isCompletedToday = (habit: any) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return habit.completion_dates?.includes(today);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>عاداتي</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Habits List */}
      <ScrollView
        style={styles.habitsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadHabits} tintColor="#6366f1" />
        }
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flame-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>ابدأ ببناء عاداتك اليومية!</Text>
            <Text style={styles.emptySubtext}>أضف عادتك الأولى للبدء</Text>
          </View>
        ) : (
          habits.map((habit) => {
            const completed = isCompletedToday(habit);
            return (
              <View
                key={habit.id}
                style={[
                  styles.habitCard,
                  { backgroundColor: habit.color + '10' },
                ]}
              >
                <View style={styles.habitHeader}>
                  <View style={styles.habitInfo}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: habit.color + '30' },
                      ]}
                    >
                      <Ionicons
                        name={habit.icon as any}
                        size={28}
                        color={habit.color}
                      />
                    </View>
                    <View style={styles.habitTextContainer}>
                      <Text style={styles.habitName}>{habit.name}</Text>
                      {habit.description && (
                        <Text style={styles.habitDescription}>
                          {habit.description}
                        </Text>
                      )}
                      <View style={styles.habitMeta}>
                        <View style={styles.streakBadge}>
                          <Ionicons name="flame" size={16} color="#f59e0b" />
                          <Text style={styles.streakText}>
                            {habit.streak} يوم
                          </Text>
                        </View>
                        <View style={styles.frequencyBadge}>
                          <Ionicons name="calendar" size={14} color="#6b7280" />
                          <Text style={styles.frequencyText}>
                            {habit.frequency === 'daily' ? 'يومي' : 'أسبوعي'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteHabit(habit.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    completed && styles.checkButtonCompleted,
                    { borderColor: habit.color },
                    completed && { backgroundColor: habit.color },
                  ]}
                  onPress={() => !completed && handleCompleteHabit(habit.id)}
                  disabled={completed}
                >
                  {completed ? (
                    <>
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                      <Text style={styles.checkButtonTextCompleted}>
                        تم الإنجاز اليوم!
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={24}
                        color={habit.color}
                      />
                      <Text
                        style={[styles.checkButtonText, { color: habit.color }]}
                      >
                        إتمام اليوم
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>عادة جديدة</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="اسم العادة"
              value={newHabit.name}
              onChangeText={(text) => setNewHabit({ ...newHabit, name: text })}
              textAlign="right"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="الوصف (اختياري)"
              value={newHabit.description}
              onChangeText={(text) =>
                setNewHabit({ ...newHabit, description: text })
              }
              multiline
              numberOfLines={3}
              textAlign="right"
            />

            <Text style={styles.label}>اختر أيقونة</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.iconScroll}
            >
              {ICON_OPTIONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    newHabit.icon === icon && styles.iconOptionActive,
                    newHabit.icon === icon && {
                      backgroundColor: newHabit.color + '20',
                    },
                  ]}
                  onPress={() => setNewHabit({ ...newHabit, icon })}
                >
                  <Ionicons
                    name={icon as any}
                    size={24}
                    color={newHabit.icon === icon ? newHabit.color : '#6b7280'}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>اختر لون</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.colorScroll}
            >
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newHabit.color === color && styles.colorOptionActive,
                  ]}
                  onPress={() => setNewHabit({ ...newHabit, color })}
                >
                  {newHabit.color === color && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>التكرار</Text>
            <View style={styles.frequencyRow}>
              <TouchableOpacity
                style={[
                  styles.frequencyOption,
                  newHabit.frequency === 'daily' && styles.frequencyOptionActive,
                ]}
                onPress={() => setNewHabit({ ...newHabit, frequency: 'daily' })}
              >
                <Ionicons
                  name="sunny"
                  size={20}
                  color={newHabit.frequency === 'daily' ? '#6366f1' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.frequencyOptionText,
                    newHabit.frequency === 'daily' &&
                      styles.frequencyOptionTextActive,
                  ]}
                >
                  يومي
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyOption,
                  newHabit.frequency === 'weekly' &&
                    styles.frequencyOptionActive,
                ]}
                onPress={() => setNewHabit({ ...newHabit, frequency: 'weekly' })}
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={newHabit.frequency === 'weekly' ? '#6366f1' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.frequencyOptionText,
                    newHabit.frequency === 'weekly' &&
                      styles.frequencyOptionTextActive,
                  ]}
                >
                  أسبوعي
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateHabit}
            >
              <Text style={styles.createButtonText}>إضافة عادة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  habitsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  habitCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  habitInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  habitTextContainer: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'right',
  },
  habitDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'right',
  },
  habitMeta: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    marginRight: 4,
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 4,
  },
  deleteButton: {
    padding: 4,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  checkButtonCompleted: {
    borderWidth: 0,
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkButtonTextCompleted: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'right',
  },
  iconScroll: {
    marginBottom: 20,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconOptionActive: {
    borderWidth: 2,
  },
  colorScroll: {
    marginBottom: 20,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  frequencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  frequencyOptionActive: {
    backgroundColor: '#f3f4f6',
    borderColor: '#6366f1',
  },
  frequencyOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  frequencyOptionTextActive: {
    color: '#6366f1',
  },
  createButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
