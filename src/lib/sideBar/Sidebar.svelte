<script lang="ts">
  const options: { [key: string]: { [key in PerkTypes]?: string } } = {
    Exotics: {
      'Armor Trait Exotic': 'Armor',
      'Weapon Frame Exotic': 'Weapon',
    },
    Weapon: {
      'Weapon Trait': 'Trait',
      'Weapon Trait Enhanced': 'Enhanced Trait',
      'Weapon Perk': 'Perk',
      'Weapon Trait Origin': 'Origin Trait',
      'Weapon Frame': 'Frame',
      'Weapon Frame Enhanced': 'Enhanced Frame',
    },
    'Abilities / Subclass stuff': {
      'Subclass Fragment': 'Fragment',
      'Subclass Aspect': 'Aspect',
      'Subclass Super': 'Super',
      'Subclass Grenade': 'Grenade',
      'Subclass Melee': 'Melee',
      'Subclass Class': 'Class',
      'Subclass Movement': 'Movement',
    },
    Mods: {
      'Armor Mod General': 'Armor General',
      'Armor Mod Activity': 'Armor Activity',
      'Armor Mod Seasonal': 'Armor Seasonal',
      'Weapon Mod': 'Weapon',
      'Ghost Mod': 'Ghost',
    },
  }
</script>

<div class="sidebar">
  <select>
    <option value="none">Select description type</option>

    {#each Object.entries(options) as [groupName, groupOptions]}
      <optgroup label={groupName}>
        {#each Object.entries(groupOptions) as [optionName, option]}
          <option value={optionName}>{option}</option>
        {/each}
      </optgroup>
    {/each}
  </select>
</div>
