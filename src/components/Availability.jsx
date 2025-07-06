// components/StyledCalendar.jsx
import React, { useState } from "react";
import styled from "styled-components";

// Generate available dates (weekdays after today)
const generateAvailableDates = (start = new Date(), daysAhead = 180) => {
  const dates = [];
  const tomorrow = new Date(start);
  tomorrow.setDate(start.getDate() + 1);

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(tomorrow);
    date.setDate(tomorrow.getDate() + i);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(date.toISOString().slice(0, 10));
    }
  }

  return dates;
};

const availableDates = generateAvailableDates();

// Styled Components
const CalendarWrapper = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  background-color: ${({ theme }) => theme.cardBg || "#f0f0f0"};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.textPrimary || "#000"};
`;

const MonthLabel = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textPrimary || "#000"};
  font-size: 1.2rem;
  cursor: pointer;

  &:disabled {
    color: #aaa;
    cursor: not-allowed;
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.3rem;
`;

const DayLabel = styled.div`
  text-align: center;
  font-size: 0.85rem;
  font-weight: bold;
  color: ${({ theme }) => theme.textSecondary || "#555"};
`;

const DayCell = styled.div`
  width: 40px;
  height: 40px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${({ $isSelected, $isAvailable, theme }) =>
    $isSelected
      ? theme.accent || "#28a745"
      : $isAvailable
      ? "#333"
      : "transparent"};
  color: ${({ $isAvailable }) => ($isAvailable ? "#fff" : "#bbb")};
  cursor: ${({ $isAvailable }) => ($isAvailable ? "pointer" : "default")};
  border: 1px solid #444;
  transition: background 0.2s ease;

  &:hover {
    background-color: ${({ $isAvailable }) =>
      $isAvailable ? "rgba(40, 167, 69, 0.3)" : "transparent"};
  }
`;

export default function StyledCalendar({ selectedDate, onChange }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  const monthYearStr = new Date(currentYear, currentMonth).toLocaleDateString("default", {
    month: "long",
    year: "numeric",
  });

  const isFutureOrCurrentMonth = (year, month) => {
    return year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth());
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDateClick = (dateStr) => {
    if (availableDates.includes(dateStr) && onChange) {
      onChange(new Date(dateStr));
    }
  };

  const renderDays = () => {
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const dateStr = date.toISOString().slice(0, 10);
      const isAvailable = availableDates.includes(dateStr);
      const isSelected = selectedDate && selectedDate.toISOString().slice(0, 10) === dateStr;

      days.push(
        <DayCell
          key={d}
          $isAvailable={isAvailable}
          $isSelected={isSelected}
          onClick={() => handleDateClick(dateStr)}
        >
          {d}
        </DayCell>
      );
    }

    return days;
  };

  return (
    <CalendarWrapper>
      <Header>
        <NavButton
          onClick={prevMonth}
          disabled={!isFutureOrCurrentMonth(currentYear, currentMonth - 1)}
        >
          ◀
        </NavButton>
        <MonthLabel>{monthYearStr}</MonthLabel>
        <NavButton onClick={nextMonth}>▶</NavButton>
      </Header>
      <DaysGrid>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <DayLabel key={day}>{day}</DayLabel>
        ))}
        {renderDays()}
      </DaysGrid>
    </CalendarWrapper>
  );
}
