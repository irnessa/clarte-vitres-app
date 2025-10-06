// Configuration de l'entreprise
const ENTREPRISE_CONFIG = {
    NOM: "CLARTÉ VITRES",
    ADRESSE: "Dijon (21000)",
    TELEPHONE: "07 77 44 84 26",
    EMAIL: "clartevitres@gmail.com",
    SIRET: "992 008 904 00011",
    GERANT: "Georges-Emmanuel Delmaet",
    MENTION_LEGALE: "TVA non applicable, article 293B du CGI",
    CONDITIONS_PAIEMENT: "Paiement à réception de facture"
};

let factureData = {};

function changerTypeFacturation() {
    const type = document.getElementById('type_facturation').value;
    const champsDuree = document.querySelectorAll('.champ-duree');
    const champsQuantite = document.querySelectorAll('.champ-quantite');
    
    if (type === 'duree') {
        champsDuree.forEach(champ => champ.classList.remove('hidden'));
        champsQuantite.forEach(champ => champ.classList.add('hidden'));
    } else {
        champsDuree.forEach(champ => champ.classList.add('hidden'));
        champsQuantite.forEach(champ => champ.classList.remove('hidden'));
    }
}

function ajouterPrestation() {
    const prestationsDiv = document.getElementById('prestations');
    const nouvellePrestation = document.querySelector('.prestation').cloneNode(true);
    
    // Réinitialiser les valeurs
    nouvellePrestation.querySelectorAll('input').forEach(input => {
        input.value = '';
    });
    
    prestationsDiv.appendChild(nouvellePrestation);
    changerTypeFacturation();
}

function supprimerPrestation(bouton) {
    const prestations = document.querySelectorAll('.prestation');
    if (prestations.length > 1) {
        bouton.closest('.prestation').remove();
    } else {
        alert('Au moins une prestation est requise');
    }
}

function collecterDonnees() {
    const prestations = [];
    const elementsPrestation = document.querySelectorAll('.prestation');
    
    elementsPrestation.forEach(prestation => {
        const date = prestation.querySelector('input[name="date"]').value;
        const designation = prestation.querySelector('input[name="designation"]').value;
        const duree = prestation.querySelector('input[name="duree"]').value;
        const quantite = prestation.querySelector('input[name="quantite"]').value;
        const prixUnitaire = parseFloat(prestation.querySelector('input[name="prix_unitaire"]').value) || 0;
        
        prestations.push({
            date,
            designation,
            valeur: document.getElementById('type_facturation').value === 'duree' ? duree : quantite,
            prix_unitaire: prixUnitaire
        });
    });
    
    return {
        client_nom: document.getElementById('client_nom').value,
        client_adresse: document.getElementById('client_adresse').value,
        mois_facture: document.getElementById('mois_facture').value,
        type_facturation: document.getElementById('type_facturation').value,
        numero_facture: genererNumeroFacture(),
        prestations: prestations
    };
}

function genererNumeroFacture() {
    const now = new Date();
    const timestamp = Math.floor(Math.random() * 1000);
    return `CV${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${timestamp.toString().padStart(3, '0')}`;
}

function calculerTotal(prestations) {
    return prestations.reduce((total, presta) => total + presta.prix_unitaire, 0);
}

function genererFacture() {
    if (!validerFormulaire()) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    factureData = collecterDonnees();
    afficherApercu();
}

function validerFormulaire() {
    const clientNom = document.getElementById('client_nom').value;
    const clientAdresse = document.getElementById('client_adresse').value;
    
    if (!clientNom || !clientAdresse) {
        return false;
    }
    
    const prestations = document.querySelectorAll('.prestation');
    for (let prestation of prestations) {
        const date = prestation.querySelector('input[name="date"]').value;
        const designation = prestation.querySelector('input[name="designation"]').value;
        const prixUnitaire = prestation.querySelector('input[name="prix_unitaire"]').value;
        
        if (!date || !designation || !prixUnitaire) {
            return false;
        }
    }
    
    return true;
}

function afficherApercu() {
    const preview = document.getElementById('facturePreview');
    preview.innerHTML = genererHTMLFacture();
    
    const modal = document.getElementById('previewModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Empêche le défilement
}

function fermerModal() {
    const modal = document.getElementById('previewModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Rétablit le défilement
}

function genererHTMLFacture() {
    const total = calculerTotal(factureData.prestations);
    const colonneType = factureData.type_facturation === 'quantite' ? 'Quantité' : 'Durée';
    
    return `
        <div class="facture-page">
            <div class="facture-header">
                <h2>${ENTREPRISE_CONFIG.NOM}</h2>
                <p>${ENTREPRISE_CONFIG.ADRESSE} | ${ENTREPRISE_CONFIG.TELEPHONE}</p>
                <p>${ENTREPRISE_CONFIG.EMAIL} | SIRET: ${ENTREPRISE_CONFIG.SIRET}</p>
                <p>Gérant: ${ENTREPRISE_CONFIG.GERANT}</p>
            </div>
            
            <div class="facture-title">FACTURE ${factureData.mois_facture.toUpperCase()}</div>
            
            <div class="facture-info">
                <strong>Facture N°:</strong> ${factureData.numero_facture} | 
                <strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}
            </div>
            
            <div class="client-info">
                <h3>CLIENT</h3>
                <p><strong>Nom:</strong> ${factureData.client_nom}</p>
                <p><strong>Adresse:</strong> ${factureData.client_adresse}</p>
            </div>
            
            <table class="prestations-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Prestation</th>
                        <th>${colonneType}</th>
                        <th>Prix unitaire HT</th>
                        <th>Total HT</th>
                    </tr>
                </thead>
                <tbody>
                    ${factureData.prestations.map(presta => `
                        <tr>
                            <td>${presta.date}</td>
                            <td>${presta.designation}</td>
                            <td>${presta.valeur}</td>
                            <td>${presta.prix_unitaire.toFixed(2)} €</td>
                            <td>${presta.prix_unitaire.toFixed(2)} €</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"></td>
                        <td><strong>Total HT:</strong></td>
                        <td><strong>${total.toFixed(2)} €</strong></td>
                    </tr>
                    <tr>
                        <td colspan="3"></td>
                        <td><strong>TVA:</strong></td>
                        <td><strong>Non applicable</strong></td>
                    </tr>
                    <tr>
                        <td colspan="3"></td>
                        <td><strong>Total TTC:</strong></td>
                        <td><strong>${total.toFixed(2)} €</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="conditions">
                <p><strong>Conditions de paiement:</strong> ${ENTREPRISE_CONFIG.CONDITIONS_PAIEMENT}</p>
                <p><strong>Mention légale:</strong> ${ENTREPRISE_CONFIG.MENTION_LEGALE}</p>
            </div>
            
            <div class="signature">
                <p>Fait à Dijon, le ${new Date().toLocaleDateString('fr-FR')}</p>
                <br><br>
                <p>Signature</p>
                <p>${ENTREPRISE_CONFIG.GERANT}</p>
            </div>
        </div>
    `;
}

function telechargerPDF() {
    // Solution simple : impression directe
    const previewContent = document.getElementById('facturePreview').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = previewContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
}

// Initialisation quand la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Application Clarté Vitres chargée !');
    
    // Événements - version corrigée
    const typeFacturation = document.getElementById('type_facturation');
    const addBtn = document.querySelector('.add-btn');
    const generateBtn = document.querySelector('.generate-btn');
    const closeBtn = document.querySelector('.close-btn');
    const secondaryBtn = document.querySelector('.secondary-btn');
    const primaryBtn = document.querySelector('.primary-btn');
    const modal = document.getElementById('previewModal');
    
    if (typeFacturation) {
        typeFacturation.addEventListener('change', changerTypeFacturation);
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', ajouterPrestation);
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', genererFacture);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', fermerModal);
    }
    
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', fermerModal);
    }
    
    if (primaryBtn) {
        primaryBtn.addEventListener('click', telechargerPDF);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                fermerModal();
            }
        });
    }
    
    // Déléguation d'événements pour les boutons de suppression
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            supprimerPrestation(e.target);
        }
    });
    
    // Initialiser l'affichage
    changerTypeFacturation();
});
