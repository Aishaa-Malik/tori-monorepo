import React from 'react';
import EmployeeClinicalOnboardingForm from './EmployeeClinicalOnboardingForm';

const ToriEmployeeHealthcareOnboarding: React.FC = () => {
  return (
    <EmployeeClinicalOnboardingForm
      mode="healthcare"
      pageTitle="Tori Employee - Healthcare Onboarding"
      pageDescription="Use this healthcare entry point to select doctor categories, prefill mapped medical services, and submit duplicate-safe records into the existing tenant schema."
      categoryLabel="Healthcare"
    />
  );
};

export default ToriEmployeeHealthcareOnboarding;
