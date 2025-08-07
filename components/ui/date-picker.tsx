import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

interface DatePickerProps {
  value?: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onDateChange,
  placeholder = 'Select date',
  size = 'xl',
  className = 'px-4 rounded-xl',
  minimumDate,
  maximumDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (date) {
      const formattedDate = formatDate(date);
      setSelectedDate(date);
      onDateChange(formattedDate);
    }
  };

  const openDatePicker = () => {
    setShowPicker(true);
  };

  return (
    <>
      <Pressable onPress={openDatePicker}>
        <View 
          className={`border border-background-300 rounded flex-row items-center overflow-hidden ${className}`}
          style={{ 
            height: size === 'xl' ? 64 : size === 'lg' ? 56 : size === 'md' ? 48 : 40,
            paddingHorizontal: 16
          }}
        >
          <Text 
            className={`flex-1 text-lg ${value ? 'text-typography-0' : 'text-typography-500'}`}
            numberOfLines={1}
          >
            {value ? formatDisplayDate(value) : placeholder}
          </Text>
        </View>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          style={Platform.OS === 'ios' ? { backgroundColor: 'white' } : undefined}
        />
      )}

      {Platform.OS === 'ios' && showPicker && (
        <Pressable
          onPress={() => setShowPicker(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1,
          }}
        />
      )}
    </>
  );
};