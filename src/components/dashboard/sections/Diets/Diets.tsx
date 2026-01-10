import { useState } from 'react';
import { Pencil, Trash2, Plus, Search, Upload, X } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { DietPlan, FoodItem, FoodType, DietFoodItem, Member } from '../../../../types/index.ts';
import './Diets.css';

interface DietsProps {
  userRole: 'admin' | 'pt';
  currentUserId?: string;
}

// Mock data
const mockFoods: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Chicken Breast',
    type: 'protein',
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.5,
    note: 'Lean protein source',
    image: '/images/placeholder.jpg',
    createdBy: 'Martell Chen',
    createdById: 'pt-1'
  },
  {
    id: 'food-2',
    name: 'Brown Rice',
    type: 'carbs',
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fats: 0.9,
    note: 'Complex carbohydrate',
    createdBy: 'Peter Johnson',
    createdById: 'pt-2'
  },
  {
    id: 'food-3',
    name: 'Brown Rice',
    type: 'carbs',
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fats: 0.9,
    note: 'Complex carbohydrate',
    createdBy: 'Martell Chen',
    createdById: 'pt-1'
  },
  {
    id: 'food-4',
    name: 'Brown Rice',
    type: 'carbs',
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fats: 0.9,
    note: 'Complex carbohydrate',
    createdBy: 'Admin',
    createdById: 'admin-1'
  }
];

const mockDiets: DietPlan[] = [
  {
    id: 'diet-1',
    name: 'Weight Loss Plan',
    description: 'Calorie deficit with high protein',
    memberId: 'SFM2301N1',
    memberName: 'Juan Dela Cruz',
    foods: [],
    totalCalories: 1800,
    protein: 150,
    carbs: 180,
    fats: 60,
    water: 3,
    note: 'Focus on lean proteins and complex carbs',
    createdBy: 'Peter Johnson',
    createdById: 'pt-2'
  },
  {
    id: 'diet-2',
    name: 'Muscle Gain Plan',
    description: 'Calorie surplus with balanced macros',
    memberId: 'SFM2301N2',
    memberName: 'Johnny Sins',
    foods: [],
    totalCalories: 2800,
    protein: 200,
    carbs: 320,
    fats: 90,
    water: 4,
    note: 'Post-workout nutrition is crucial',
    createdBy: 'Martell Chen',
    createdById: 'pt-1'
  }
];

const mockMembers: Member[] = [
  { id: 'SFM2301N1', name: 'Johnny Sins', email: '', phone: '', dateOfBirth: '', gender: 'male', cccd: '', avatar: '/images/user-icon-placeholder.png', dateJoined: '11/01/2026', status: 'active' },
  { id: 'SFM2301N2', name: 'Juan Dela Cruz', email: '', phone: '', dateOfBirth: '', gender: 'male', cccd: '', dateJoined: '11/01/2026', status: 'active' },
  { id: 'SFM2301N3', name: 'Jen Velasquez', email: '', phone: '', dateOfBirth: '', gender: 'female', cccd: '', dateJoined: '20/01/2026', status: 'no-contract' },
  { id: 'SFM2301N4', name: 'Tom Hall', email: '', phone: '', dateOfBirth: '', gender: 'male', cccd: '', dateJoined: '15/01/2025', status: 'expired' }
];

const FOOD_TYPES: { value: FoodType; label: string }[] = [
  { value: 'protein', label: 'Protein' },
  { value: 'carbs', label: 'Carbs' },
  { value: 'fats', label: 'Fats' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'dairy', label: 'Dairy' }
];

function Diets({ userRole, currentUserId }: DietsProps) {
  const [activeTab, setActiveTab] = useState<'diets' | 'food'>('diets');

  // Diet states
  const [showDietModal, setShowDietModal] = useState(false);
  const [showEditDietModal, setShowEditDietModal] = useState(false);
  const [, setSelectedDiet] = useState<DietPlan | null>(null);

  // Food states
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Member selection
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [memberPage, setMemberPage] = useState(1);

  // Diet form
  const [dietForm, setDietForm] = useState({
    name: '',
    memberId: '',
    memberName: '',
    foods: [] as DietFoodItem[],
    water: 0,
    note: ''
  });

  // Food form  
  const [foodForm, setFoodForm] = useState({
    name: '',
    type: '' as FoodType | '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    note: '',
    image: ''
  });

  const stats = {
    activeDiets: mockDiets.length,
    foodDatabase: mockFoods.length,
    avgCalories: Math.round(mockDiets.reduce((sum, d) => sum + d.totalCalories, 0) / mockDiets.length),
    nutritionists: 2
  };

  const canEdit = (createdById: string) => {
    if (userRole === 'admin') return true;
    return createdById === currentUserId;
  };

  const filteredMembers = mockMembers.filter(m =>
    m.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );
  const paginatedMembers = filteredMembers.slice((memberPage - 1) * 4, memberPage * 4);
  const totalMemberPages = Math.ceil(filteredMembers.length / 4);

  const selectMember = (member: Member) => {
    setDietForm({ ...dietForm, memberId: member.id, memberName: member.name });
  };

  const addFoodItem = () => {
    setDietForm({
      ...dietForm,
      foods: [...dietForm.foods, {
        foodId: '',
        foodName: '',
        quantity: 0,
        calories: 0,
        mealType: '',
        prepMethod: ''
      }]
    });
  };

  const removeFoodItem = (index: number) => {
    setDietForm({
      ...dietForm,
      foods: dietForm.foods.filter((_, i) => i !== index)
    });
  };

  const updateFoodItem = (index: number, field: string, value: string | number) => {
    const newFoods = [...dietForm.foods];
    newFoods[index] = { ...newFoods[index], [field]: value };

    // Auto-fill when food is selected
    if (field === 'foodId') {
      const food = mockFoods.find(f => f.id === value);
      if (food) {
        newFoods[index].foodName = food.name;
        newFoods[index].mealType = food.type;
        newFoods[index].calories = food.calories;
      }
    }

    setDietForm({ ...dietForm, foods: newFoods });
  };

  const calculateMacros = () => {
    const totalCals = dietForm.foods.reduce((sum, f) => sum + (f.calories * f.quantity / 100), 0);
    if (totalCals === 0) return { protein: 33, carbs: 34, fat: 33 };

    // Simplified calculation
    return { protein: 30, carbs: 39, fat: 31 };
  };

  const handleCreateDiet = () => {
    console.log('Creating diet:', dietForm);
    setShowDietModal(false);
    resetDietForm();
  };

  const handleUpdateDiet = () => {
    console.log('Updating diet:', dietForm);
    setShowEditDietModal(false);
    resetDietForm();
  };

  const handleEditDiet = (diet: DietPlan) => {
    setSelectedDiet(diet);
    setDietForm({
      name: diet.name,
      memberId: diet.memberId,
      memberName: diet.memberName,
      foods: diet.foods,
      water: diet.water,
      note: diet.note || ''
    });
    setShowEditDietModal(true);
  };

  const handleDeleteDiet = (diet: DietPlan) => {
    if (confirm(`Delete "${diet.name}"?`)) {
      console.log('Deleting diet:', diet.id);
    }
  };

  const handleCreateFood = () => {
    console.log('Creating food:', foodForm);
    setShowFoodModal(false);
    resetFoodForm();
  };

  const handleUpdateFood = () => {
    console.log('Updating food:', foodForm);
    setShowEditFoodModal(false);
    resetFoodForm();
  };

  const handleEditFood = (food: FoodItem) => {
    setSelectedFood(food);
    setFoodForm({
      name: food.name,
      type: food.type,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      note: food.note,
      image: food.image || ''
    });
    setShowEditFoodModal(true);
  };

  const handleDeleteFood = (food: FoodItem) => {
    if (confirm(`Delete "${food.name}"?`)) {
      console.log('Deleting food:', food.id);
    }
  };

  const resetDietForm = () => {
    setDietForm({ name: '', memberId: '', memberName: '', foods: [], water: 0, note: '' });
    setSelectedDiet(null);
  };

  const resetFoodForm = () => {
    setFoodForm({ name: '', type: '', calories: 0, protein: 0, carbs: 0, fats: 0, note: '', image: '' });
    setSelectedFood(null);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string }> = {
      'active': { className: 'diets__status--active' },
      'no-contract': { className: 'diets__status--warning' },
      'expired': { className: 'diets__status--expired' }
    };
    return config[status] || { className: '' };
  };

  const renderFooter = (onCancel: () => void, onSubmit: () => void, submitLabel: string) => (
    <>
      <button className="modal-form__btn modal-form__btn--secondary" onClick={onCancel}>
        Cancel
      </button>
      <button className="modal-form__btn modal-form__btn--primary" onClick={onSubmit}>
        {submitLabel}
      </button>
    </>
  );

  const macros = calculateMacros();

  return (
    <div className="diets">
      <div className="diets__header">
        <div>
          <h1 className="diets__title">Diet & Nutrition</h1>
          <p className="diets__subtitle">Manage diet plans and food database</p>
        </div>
        {activeTab === 'food' ? (
          <button className="diets__add-btn" onClick={() => setShowFoodModal(true)}>
            + Add Food
          </button>
        ) : <button className="diets__add-btn" onClick={() => setShowDietModal(true)}>
          + Create Diet Plan
        </button>
        }
      </div>

      {/* Stats */}
      <div className="diets__stats">
        <div className="diets__stat">
          <span className="diets__stat-label">Active Diets</span>
          <span className="diets__stat-value">{stats.activeDiets}</span>
        </div>
        <div className="diets__stat">
          <span className="diets__stat-label">Food Database</span>
          <span className="diets__stat-value">{stats.foodDatabase}</span>
        </div>
        <div className="diets__stat">
          <span className="diets__stat-label">Avg. daily Calories</span>
          <span className="diets__stat-value">{stats.avgCalories}</span>
        </div>
        <div className="diets__stat">
          <span className="diets__stat-label">Nutritionists</span>
          <span className="diets__stat-value">{stats.nutritionists}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="diets__tabs">
        <button
          className={`diets__tab ${activeTab === 'diets' ? 'diets__tab--active' : ''}`}
          onClick={() => setActiveTab('diets')}
        >
          Diets
        </button>
        <button
          className={`diets__tab ${activeTab === 'food' ? 'diets__tab--active' : ''}`}
          onClick={() => setActiveTab('food')}
        >
          Food
        </button>
      </div>

      {/* Diets Tab */}
      {activeTab === 'diets' && (
        <div className="diets__content">
          <div className="diets__list">
            {mockDiets.map((diet) => (
              <div key={diet.id} className="diets__card">
                <div className="diets__card-header">
                  <div className="diets__card-icon">
                    <span>🥗</span>
                  </div>
                  <div className="diets__card-title-section">
                    <h3 className="diets__card-name">{diet.name}</h3>
                    <p className="diets__card-meta">
                      by {diet.createdBy} • for {diet.memberName}
                    </p>
                    <p className="diets__card-desc">{diet.description}</p>
                  </div>
                  {canEdit(diet.createdById) && (
                    <div className="diets__card-actions">
                      <button onClick={() => handleEditDiet(diet)}><Pencil size={16} /></button>
                      <button className="diets__card-action--delete" onClick={() => handleDeleteDiet(diet)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="diets__card-macros">
                  <div className="diets__card-macro">
                    <span className="diets__card-macro-label">Calories</span>
                    <span className="diets__card-macro-value">{diet.totalCalories}</span>
                    <span className="diets__card-macro-unit">kcal/day</span>
                  </div>
                  <div className="diets__card-macro">
                    <span className="diets__card-macro-label">Protein</span>
                    <span className="diets__card-macro-value">{diet.protein}g</span>
                    <span className="diets__card-macro-unit">30%</span>
                  </div>
                  <div className="diets__card-macro">
                    <span className="diets__card-macro-label">Carbs</span>
                    <span className="diets__card-macro-value">{diet.carbs}g</span>
                    <span className="diets__card-macro-unit">40%</span>
                  </div>
                  <div className="diets__card-macro">
                    <span className="diets__card-macro-label">Fats</span>
                    <span className="diets__card-macro-value">{diet.fats}g</span>
                    <span className="diets__card-macro-unit">30%</span>
                  </div>
                  <div className="diets__card-macro">
                    <span className="diets__card-macro-label">Water</span>
                    <span className="diets__card-macro-value">{diet.water}L</span>
                    <span className="diets__card-macro-unit">per day</span>
                  </div>
                </div>

                {diet.note && (
                  <div className="diets__card-note">
                    <span className="diets__card-note-label">Note:</span> {diet.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food Tab */}
      {activeTab === 'food' && (
        <div className="diets__content">
          <div className="diets__food-grid">
            {mockFoods.map((food) => (
              <div key={food.id} className="diets__food-card">
                <div className="diets__food-header">
                  <h3 className="diets__food-name">{food.name} (100g)</h3>
                  {canEdit(food.createdById) && (
                    <div className="diets__food-actions">
                      <button onClick={() => handleEditFood(food)}><Pencil size={16} /></button>
                      <button className="diets__food-action--delete" onClick={() => handleDeleteFood(food)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <span className={`diets__food-type diets__food-type--${food.type}`}>
                  {food.type}
                </span>
                <div className="diets__food-nutrition">
                  <p>Protein: {food.protein}g</p>
                  <p>Carbs: {food.carbs}g</p>
                  <p>Fats: {food.fats}g</p>
                </div>
                <div className="diets__food-calories">
                  <span className="diets__food-calories-label">Calories</span>
                  <span className="diets__food-calories-value">{food.calories}</span>
                  <span className="diets__food-calories-unit">kcal</span>
                </div>
                <p className="diets__food-note">{food.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Diet Modal */}
      <Modal
        isOpen={showDietModal}
        onClose={() => { setShowDietModal(false); resetDietForm(); }}
        title="Create New Diet Plan"
        size="lg"
        footer={renderFooter(
          () => { setShowDietModal(false); resetDietForm(); },
          handleCreateDiet,
          'Create Diet Plan'
        )}
      >
        <div className="modal-form">
          <h3 className="diets__form-section">Basic Information</h3>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Plan Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g., Weight Loss Plan"
              value={dietForm.name}
              onChange={(e) => setDietForm({ ...dietForm, name: e.target.value })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Member</label>
            <input
              type="text"
              className="modal-form__input"
              value={dietForm.memberName}
              readOnly
              placeholder="Select a member below"
            />
          </div>

          {/* Recommended Foods Section */}
          <div className="diets__foods-section">
            <div className="diets__foods-header">
              <h3 className="diets__form-section">Recommended Foods</h3>
              <button type="button" className="diets__add-food-btn" onClick={addFoodItem}>
                <Plus size={16} /> Add Food
              </button>
            </div>

            {dietForm.foods.map((item, index) => (
              <div key={index} className="diets__food-item-form">
                <div className="diets__food-item-header">
                  <h4 className="diets__food-item-title">Food Item #{index + 1}</h4>
                  <button
                    type="button"
                    className="diets__food-item-remove"
                    onClick={() => removeFoodItem(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="modal-form__row">
                  <div className="modal-form__group">
                    <label className="modal-form__label modal-form__label--required">Food</label>
                    <select
                      className="modal-form__select"
                      value={item.foodId}
                      onChange={(e) => updateFoodItem(index, 'foodId', e.target.value)}
                    >
                      <option value="">Select Food</option>
                      {mockFoods.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-form__group">
                    <label className="modal-form__label modal-form__label--required">Quantity(g)</label>
                    <input
                      type="number"
                      className="modal-form__input"
                      value={item.quantity || ''}
                      onChange={(e) => updateFoodItem(index, 'quantity', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="modal-form__row">
                  <div className="modal-form__group">
                    <label className="modal-form__label">Meal Type</label>
                    <input
                      type="text"
                      className="modal-form__input"
                      value={item.mealType}
                      readOnly
                      placeholder="Type"
                    />
                  </div>
                  <div className="modal-form__group">
                    <label className="modal-form__label">Calories</label>
                    <input
                      type="number"
                      className="modal-form__input"
                      value={item.calories || ''}
                      readOnly
                    />
                  </div>
                </div>

                <div className="modal-form__group">
                  <label className="modal-form__label modal-form__label--required">Prep method</label>
                  <textarea
                    className="modal-form__textarea"
                    placeholder="Describe the way to prepare this food..."
                    value={item.prepMethod}
                    onChange={(e) => updateFoodItem(index, 'prepMethod', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Macro Breakdown */}
          <div className="diets__macro-breakdown">
            <h4 className="diets__macro-breakdown-title">Macro Breakdown</h4>
            <div className="diets__macro-bar">
              <div className="diets__macro-bar-protein" style={{ width: `${macros.protein}%` }}>
                {macros.protein}%
              </div>
              <div className="diets__macro-bar-carbs" style={{ width: `${macros.carbs}%` }}>
                {macros.carbs}%
              </div>
              <div className="diets__macro-bar-fat" style={{ width: `${macros.fat}%` }}>
                {macros.fat}%
              </div>
            </div>
            <div className="diets__macro-legend">
              <span><span className="diets__macro-dot diets__macro-dot--protein"></span> Protein</span>
              <span><span className="diets__macro-dot diets__macro-dot--carbs"></span> Carbs</span>
              <span><span className="diets__macro-dot diets__macro-dot--fat"></span> Fat</span>
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Amount of water (Liters)</label>
            <input
              type="number"
              className="modal-form__input"
              value={dietForm.water || ''}
              onChange={(e) => setDietForm({ ...dietForm, water: Number(e.target.value) })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Additional Notes</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Special instructions, meal timing, supplements, etc..."
              value={dietForm.note}
              onChange={(e) => setDietForm({ ...dietForm, note: e.target.value })}
            />
          </div>

          {/* Member Selection */}
          <div className="diets__member-select">
            <div className="diets__member-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by member name or ID..."
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
              />
            </div>
            <table className="diets__member-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>PFP</th>
                  <th>Member ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((member) => (
                  <tr
                    key={member.id}
                    className={dietForm.memberId === member.id ? 'diets__member-row--selected' : ''}
                    onClick={() => selectMember(member)}
                  >
                    <td>{member.name}</td>
                    <td>
                      <img
                        src={member.avatar || '/images/user-icon-placeholder.png'}
                        alt={member.name}
                        className="diets__member-avatar"
                      />
                    </td>
                    <td>{member.id}</td>
                    <td>
                      <span className={`diets__status ${getStatusBadge(member.status).className}`}>
                        {member.status === 'no-contract' ? 'No Contract' : member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="diets__member-pagination">
              <button
                disabled={memberPage === 1}
                onClick={() => setMemberPage(p => p - 1)}
              >
                Previous
              </button>
              <button
                disabled={memberPage >= totalMemberPages}
                onClick={() => setMemberPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Diet Modal */}
      <Modal
        isOpen={showEditDietModal}
        onClose={() => { setShowEditDietModal(false); resetDietForm(); }}
        title="Edit Diet Plan"
        size="lg"
        footer={renderFooter(
          () => { setShowEditDietModal(false); resetDietForm(); },
          handleUpdateDiet,
          'Update Diet Plan'
        )}
      >
        <div className="modal-form">
          <h3 className="diets__form-section">Basic Information</h3>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Plan Name</label>
            <input
              type="text"
              className="modal-form__input"
              value={dietForm.name}
              onChange={(e) => setDietForm({ ...dietForm, name: e.target.value })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Member</label>
            <input
              type="text"
              className="modal-form__input"
              value={dietForm.memberName}
              readOnly
            />
          </div>

          <div className="diets__foods-section">
            <div className="diets__foods-header">
              <h3 className="diets__form-section">Recommended Foods</h3>
              <button type="button" className="diets__add-food-btn" onClick={addFoodItem}>
                <Plus size={16} /> Add Food
              </button>
            </div>

            {dietForm.foods.map((item, index) => (
              <div key={index} className="diets__food-item-form">
                <div className="diets__food-item-header">
                  <h4 className="diets__food-item-title">Food Item #{index + 1}</h4>
                  <button type="button" className="diets__food-item-remove" onClick={() => removeFoodItem(index)}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="modal-form__row">
                  <div className="modal-form__group">
                    <label className="modal-form__label modal-form__label--required">Food</label>
                    <select
                      className="modal-form__select"
                      value={item.foodId}
                      onChange={(e) => updateFoodItem(index, 'foodId', e.target.value)}
                    >
                      <option value="">Select Food</option>
                      {mockFoods.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-form__group">
                    <label className="modal-form__label modal-form__label--required">Quantity(g)</label>
                    <input
                      type="number"
                      className="modal-form__input"
                      value={item.quantity || ''}
                      onChange={(e) => updateFoodItem(index, 'quantity', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="modal-form__row">
                  <div className="modal-form__group">
                    <label className="modal-form__label">Meal Type</label>
                    <input type="text" className="modal-form__input" value={item.mealType} readOnly />
                  </div>
                  <div className="modal-form__group">
                    <label className="modal-form__label">Calories</label>
                    <input type="number" className="modal-form__input" value={item.calories || ''} readOnly />
                  </div>
                </div>

                <div className="modal-form__group">
                  <label className="modal-form__label modal-form__label--required">Prep method</label>
                  <textarea
                    className="modal-form__textarea"
                    value={item.prepMethod}
                    onChange={(e) => updateFoodItem(index, 'prepMethod', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="diets__macro-breakdown">
            <h4 className="diets__macro-breakdown-title">Macro Breakdown</h4>
            <div className="diets__macro-bar">
              <div className="diets__macro-bar-protein" style={{ width: `${macros.protein}%` }}>{macros.protein}%</div>
              <div className="diets__macro-bar-carbs" style={{ width: `${macros.carbs}%` }}>{macros.carbs}%</div>
              <div className="diets__macro-bar-fat" style={{ width: `${macros.fat}%` }}>{macros.fat}%</div>
            </div>
            <div className="diets__macro-legend">
              <span><span className="diets__macro-dot diets__macro-dot--protein"></span> Protein</span>
              <span><span className="diets__macro-dot diets__macro-dot--carbs"></span> Carbs</span>
              <span><span className="diets__macro-dot diets__macro-dot--fat"></span> Fat</span>
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Amount of water (Liters)</label>
            <input
              type="number"
              className="modal-form__input"
              value={dietForm.water || ''}
              onChange={(e) => setDietForm({ ...dietForm, water: Number(e.target.value) })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Additional Notes</label>
            <textarea
              className="modal-form__textarea"
              value={dietForm.note}
              onChange={(e) => setDietForm({ ...dietForm, note: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Add Food Modal */}
      <Modal
        isOpen={showFoodModal}
        onClose={() => { setShowFoodModal(false); resetFoodForm(); }}
        title="Add Food Item"
        size="md"
        footer={renderFooter(
          () => { setShowFoodModal(false); resetFoodForm(); },
          handleCreateFood,
          'Add Food'
        )}
      >
        <div className="modal-form">
          <p className="diets__food-modal-note">*Nutrition per 100 grams of food</p>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="ex: Chicken Breast"
              value={foodForm.name}
              onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Type</label>
            <select
              className="modal-form__select"
              value={foodForm.type}
              onChange={(e) => setFoodForm({ ...foodForm, type: e.target.value as FoodType })}
            >
              <option value="">Select Type</option>
              {FOOD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Calories</label>
            <input
              type="number"
              className="modal-form__input"
              value={foodForm.calories || ''}
              onChange={(e) => setFoodForm({ ...foodForm, calories: Number(e.target.value) })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Note</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="Description of the food..."
              value={foodForm.note}
              onChange={(e) => setFoodForm({ ...foodForm, note: e.target.value })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Food Photo (Optional)</label>
            <div className="diets__photo-upload">
              <div className="diets__photo-preview">
                <img src="/images/placeholder.jpg" alt="Preview" />
              </div>
              <div className="diets__photo-dropzone">
                <Upload size={24} />
                <span>Click to upload or drag and drop</span>
                <span className="diets__photo-hint">PNG, JPG, JPEG up to 5MB</span>
              </div>
            </div>
            <span className="modal-form__hint">Recommended: Square image, minimum 300x300px for best quality</span>
          </div>

          <h3 className="diets__form-section">Nutritional Quantities (grams)</h3>
          <div className="modal-form__row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Protein</label>
              <input
                type="number"
                className="modal-form__input"
                value={foodForm.protein || ''}
                onChange={(e) => setFoodForm({ ...foodForm, protein: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Carbs</label>
              <input
                type="number"
                className="modal-form__input"
                value={foodForm.carbs || ''}
                onChange={(e) => setFoodForm({ ...foodForm, carbs: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Fats</label>
              <input
                type="number"
                className="modal-form__input"
                value={foodForm.fats || ''}
                onChange={(e) => setFoodForm({ ...foodForm, fats: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Food Modal */}
      <Modal
        isOpen={showEditFoodModal}
        onClose={() => { setShowEditFoodModal(false); resetFoodForm(); }}
        title="Edit Food Item"
        size="md"
        footer={renderFooter(
          () => { setShowEditFoodModal(false); resetFoodForm(); },
          handleUpdateFood,
          'Confirm'
        )}
      >
        <div className="modal-form">
          <p className="diets__food-modal-note">*Nutrition per 100 grams of food</p>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Name</label>
            <input
              type="text"
              className="modal-form__input"
              value={foodForm.name}
              onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Type</label>
            <select
              className="modal-form__select"
              value={foodForm.type}
              onChange={(e) => setFoodForm({ ...foodForm, type: e.target.value as FoodType })}
            >
              <option value="">Select Type</option>
              {FOOD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Calories</label>
            <input
              type="number"
              className="modal-form__input"
              value={foodForm.calories || ''}
              onChange={(e) => setFoodForm({ ...foodForm, calories: Number(e.target.value) })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Note</label>
            <input
              type="text"
              className="modal-form__input"
              value={foodForm.note}
              onChange={(e) => setFoodForm({ ...foodForm, note: e.target.value })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Food Photo (Optional)</label>
            <div className="diets__photo-upload">
              <div className="diets__photo-preview diets__photo-preview--has-image">
                <img src={selectedFood?.image || '/images/placeholder.jpg'} alt="Preview" />
                {selectedFood?.image && (
                  <button className="diets__photo-remove">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            <span className="modal-form__hint">Recommended: Square image, minimum 300x300px for best quality</span>
          </div>

          <h3 className="diets__form-section">Nutritional Quantities (grams)</h3>
          <div className="modal-form__row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Protein</label>
              <input
                type="number"
                className="modal-form__input"
                value={foodForm.protein || ''}
                onChange={(e) => setFoodForm({ ...foodForm, protein: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Carbs</label>
              <input
                type="number"
                className="modal-form__input"
                value={foodForm.carbs || ''}
                onChange={(e) => setFoodForm({ ...foodForm, carbs: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Fats</label>
              <input
                type="number"
                className="modal-form__input"
                value={foodForm.fats || ''}
                onChange={(e) => setFoodForm({ ...foodForm, fats: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Diets;
