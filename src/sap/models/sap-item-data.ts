export interface SapItemData {
  ItemCode: string;
  ItemName: string;
  TreeType: string;
  U_CCF_Type: string;

  // Nutrients
  U_BOYX_Energi?: string;
  U_BOYX_Energik?: string;
  U_BOYX_fedt?: string;
  U_BOYX_fedtsyre?: string;
  U_BOYX_Kulhydrat?: string;
  U_BOYX_sukkerarter?: string;
  U_BOYX_Protein?: string;
  U_BOYX_salt?: string;

  // Allergens
  U_BOYX_gluten?: string;
  U_BOYX_Krebsdyr?: string;
  U_BOYX_aag?: string;
  U_BOYX_fisk?: string;
  U_BOYX_JN?: string;
  U_BOYX_soja?: string;
  U_BOYX_ML?: string;
  U_BOYX_mandel?: string;
  U_BOYX_hassel?: string;
  U_BOYX_val?: string;
  U_BOYX_Cashe?: string;
  U_BOYX_Pekan?: string;
  U_BOYX_peka?: string;
  U_BOYX_Pistacie?: string;
  U_BOYX_Queensland?: string;
  U_BOYX_Selleri?: string;
  U_BOYX_Sennep?: string;
  U_BOYX_Sesam?: string;
  U_BOYX_Svovldioxid?: string;
  U_BOYX_Lupin?: string;
  U_BOYX_BL?: string;

  // Ingredients description
  U_CCF_Ingrediens_DA?: string;
}
