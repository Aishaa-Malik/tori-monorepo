import React from 'react';
import EmployeeClinicalOnboardingForm from './EmployeeClinicalOnboardingForm';

const ToriEmployeePhysiotherapyOnboarding: React.FC = () => {
  return (
    <EmployeeClinicalOnboardingForm
      mode="physiotherapy"
      pageTitle="Tori Employee - Physiotherapy Onboarding"
      pageDescription="Use this physiotherapy onboarding flow to pre-populate common clinic services, reduce manual data entry, and submit directly into the production onboarding pipeline."
      categoryLabel="Physiotherapy"
    />
  );
};

export default ToriEmployeePhysiotherapyOnboarding;
